import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BimRepository } from './bim.repository';
import { CreateBimModelDto } from './dto/create-bim-model.dto';
import { UpdateBimModelDto } from './dto/update-bim-model.dto';
import { QueryBimModelDto } from './dto/query-bim-model.dto';
import { CompareBimModelsDto } from './dto/compare-bim-models.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class BimService {
  constructor(
    private readonly repo: BimRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createModel(createDto: CreateBimModelDto, userId?: string) {
    // 1. Validate that the parent project exists
    const project = await this.prisma.project.findFirst({
      where: { id: createDto.projectId, deletedAt: null },
    });
    if (!project) {
      throw new NotFoundException('Project not found or deleted.');
    }

    // 2. Format validation check
    const extension = createDto.fileUrl.split('.').pop()?.toLowerCase();
    const typeUpper = createDto.fileType.toUpperCase();
    if (typeUpper === 'IFC' && extension !== 'ifc') {
      throw new BadRequestException('IFC models require a .ifc file extension.');
    }
    if (typeUpper === 'RVT' && extension !== 'rvt') {
      throw new BadRequestException('Revit models require a .rvt file extension.');
    }

    // 3. Model Versioning: Check if model name already exists in project and auto-increment version
    const latestModel = await this.repo.findLatestVersion(createDto.projectId, createDto.name);
    const versionNumber = latestModel ? latestModel.version + 1 : 1;

    // 4. Create model record (PROCESSING state)
    const model = await this.repo.createModel(createDto, versionNumber);

    // 5. Audit Log create
    await this.audit.log({
      action: 'INSERT',
      tableName: 'BimModel',
      recordId: model.id,
      newValues: model,
      userId,
      organizationId: project.organizationId,
    });

    // 6. Simulate Element Extraction (asynchronous-like processing, completes instantly here)
    const mockExtractedElements = this.simulateElementExtraction(model.id, model.fileType);
    await this.repo.createElements(model.id, mockExtractedElements);

    // Update model status to COMPLETED
    const updatedModel = await this.repo.updateModel(model.id, {
      status: 'COMPLETED',
      metadata: {
        ...((model.metadata as Record<string, any>) || {}),
        extractedElementsCount: mockExtractedElements.length,
        softwareSource: model.fileType === 'IFC' ? 'IFCOpenShell v0.7.0' : 'Revit API Forge Engine',
      },
    });

    return updatedModel;
  }

  async findModelById(id: string) {
    const model = await this.repo.findModelById(id, true);
    if (!model) {
      throw new NotFoundException('BIM Model not found.');
    }
    return model;
  }

  async updateModel(id: string, updateDto: UpdateBimModelDto, userId?: string) {
    const existing = await this.repo.findModelById(id);
    if (!existing) {
      throw new NotFoundException('BIM Model not found.');
    }

    const updated = await this.repo.updateModel(id, updateDto);

    await this.audit.log({
      action: 'UPDATE',
      tableName: 'BimModel',
      recordId: id,
      newValues: updated,
      userId,
      organizationId: existing.project?.organizationId,
    });

    return updated;
  }

  async findAllModels(query: QueryBimModelDto) {
    return this.repo.findAllModels(query);
  }

  async softDeleteModel(id: string, userId?: string) {
    const existing = await this.repo.findModelById(id);
    if (!existing) {
      throw new NotFoundException('BIM Model not found.');
    }

    const deleted = await this.repo.softDeleteModel(id);

    await this.audit.log({
      action: 'DELETE',
      tableName: 'BimModel',
      recordId: id,
      newValues: deleted,
      userId,
      organizationId: existing.project?.organizationId,
    });

    return deleted;
  }

  async restoreModel(id: string, userId?: string) {
    const existing = await this.repo.findModelById(id, false, true);
    if (!existing) {
      throw new NotFoundException('BIM Model not found.');
    }

    const restored = await this.repo.restoreModel(id);

    await this.audit.log({
      action: 'RESTORE',
      tableName: 'BimModel',
      recordId: id,
      newValues: restored,
      userId,
      organizationId: existing.project?.organizationId,
    });

    return restored;
  }

  async alignCoordinates(id: string, coordinateSystem: Record<string, any>, userId?: string) {
    if (!coordinateSystem.origin || !coordinateSystem.crs) {
      throw new BadRequestException('Coordinate Alignment requires crs and origin properties.');
    }

    return this.updateModel(id, { coordinateSystem }, userId);
  }

  async compareModels(compareDto: CompareBimModelsDto) {
    const sourceModel = await this.repo.findModelById(compareDto.sourceModelId, false);
    const targetModel = await this.repo.findModelById(compareDto.targetModelId, false);

    if (!sourceModel || !targetModel) {
      throw new NotFoundException('One or both BIM models could not be found.');
    }

    if (sourceModel.projectId !== targetModel.projectId) {
      throw new BadRequestException('Model comparison must be done within the same project bounds.');
    }

    const sourceElements = await this.repo.findElementsByModel(compareDto.sourceModelId);
    const targetElements = await this.repo.findElementsByModel(compareDto.targetModelId);

    const sourceMap = new Map(sourceElements.map(el => [el.externalId, el]));
    const targetMap = new Map(targetElements.map(el => [el.externalId, el]));

    const added: any[] = [];
    const deleted: any[] = [];
    const modified: any[] = [];
    let unchangedCount = 0;

    // Added and Modified checks
    for (const [extId, targetEl] of targetMap.entries()) {
      const sourceEl = sourceMap.get(extId);
      if (!sourceEl) {
        added.push(targetEl);
      } else {
        const isModified = this.areElementsDifferent(sourceEl, targetEl);
        if (isModified) {
          modified.push({
            elementId: targetEl.id,
            externalId: extId,
            name: targetEl.name,
            type: targetEl.type,
            changes: {
              previousProperties: sourceEl.properties,
              updatedProperties: targetEl.properties,
              previousGeometry: sourceEl.geometry,
              updatedGeometry: targetEl.geometry,
            },
          });
        } else {
          unchangedCount++;
        }
      }
    }

    // Deleted checks
    for (const [extId, sourceEl] of sourceMap.entries()) {
      if (!targetMap.has(extId)) {
        deleted.push(sourceEl);
      }
    }

    return {
      comparisonSummary: {
        addedCount: added.length,
        deletedCount: deleted.length,
        modifiedCount: modified.length,
        unchangedCount,
        totalSourceElements: sourceElements.length,
        totalTargetElements: targetElements.length,
      },
      added,
      deleted,
      modified,
    };
  }

  private areElementsDifferent(source: any, target: any): boolean {
    const sourceVol = source.properties?.Volume || source.properties?.volume;
    const targetVol = target.properties?.Volume || target.properties?.volume;
    if (sourceVol !== targetVol) return true;

    const sourceArea = source.properties?.Area || source.properties?.area;
    const targetArea = target.properties?.Area || target.properties?.area;
    if (sourceArea !== targetArea) return true;

    // Check geometry changes
    const sourceGeo = JSON.stringify(source.geometry);
    const targetGeo = JSON.stringify(target.geometry);
    return sourceGeo !== targetGeo;
  }

  private simulateElementExtraction(modelId: string, format: string) {
    const elements: any[] = [];

    if (format.toUpperCase() === 'IFC') {
      elements.push(
        {
          externalId: 'IFC-WALL-0192A9',
          name: 'Concrete Wall Standard Case [C25/30]',
          type: 'IFCWALLSTANDARDCASE',
          category: 'Structural',
          geometry: { boundingBox: { min: [0, 0, 0], max: [5, 0.3, 3] } },
          properties: { Volume: '4.5 cum', Area: '15.0 sqm', Height: '3.0m', Material: 'Concrete C25/30' },
        },
        {
          externalId: 'IFC-SLAB-09A111',
          name: 'Suspended Floor Slab [C30/37]',
          type: 'IFCSLAB',
          category: 'Structural',
          geometry: { boundingBox: { min: [0, 0, 3], max: [12, 10, 3.2] } },
          properties: { Volume: '24.0 cum', Area: '120.0 sqm', Thickness: '200mm', ReinforcementWeight: '1.2 tons' },
        },
        {
          externalId: 'IFC-COLUMN-881A2',
          name: 'Rectangular Support Column [600x400]',
          type: 'IFCCOLUMN',
          category: 'Structural',
          geometry: { boundingBox: { min: [0, 0, 0], max: [0.6, 0.4, 3] } },
          properties: { Volume: '0.72 cum', Height: '3.0m', ReinforcementGrid: 'T16@150cc' },
        }
      );
    } else {
      // Revit elements
      elements.push(
        {
          externalId: 'RVT-WALL-772183',
          name: 'Basic Wall: Generic - 200mm Concrete',
          type: 'Wall',
          category: 'Architectural',
          geometry: { boundingBox: { min: [0, 0, 0], max: [8, 0.2, 2.9] } },
          properties: { volume: '3.2 cum', area: '16.0 sqm', width: '200mm' },
        },
        {
          externalId: 'RVT-COLUMN-99018A',
          name: 'M_Concrete-Rectangular-Column: 450 x 600mm',
          type: 'Structural Columns',
          category: 'Structural',
          geometry: { boundingBox: { min: [4, 2, 0], max: [4.45, 2.6, 3] } },
          properties: { volume: '0.81 cum', structuralMaterial: 'Concrete - Cast-in-Place Gray', baseLevel: 'Level 1' },
        },
        {
          externalId: 'RVT-WINDOW-11200E',
          name: 'M_Fixed: 0915 x 1220mm',
          type: 'Windows',
          category: 'Architectural',
          geometry: { boundingBox: { min: [1.5, 0, 1], max: [2.415, 0.2, 2.22] } },
          properties: { height: '1220mm', width: '915mm', frameMaterial: 'Aluminum' },
        }
      );
    }

    return elements;
  }
}
