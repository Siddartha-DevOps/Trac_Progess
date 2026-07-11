import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BimElementResponseDto {
  @ApiProperty({ example: 'elem-abc-123' })
  id: string;

  @ApiProperty({ example: '1A2b3c4d5e' })
  externalId: string;

  @ApiProperty({ example: 'Basic Wall:Generic - 200mm' })
  name: string;

  @ApiProperty({ example: 'IFCWALLSTANDARDCASE' })
  type: string;

  @ApiProperty({ example: 'Structural' })
  category: string;

  @ApiPropertyOptional({ example: { boundingBox: { min: [0, 0, 0], max: [2, 0.2, 3] } } })
  geometry?: any;

  @ApiPropertyOptional({ example: { Area: '15.5 sqm', Volume: '3.1 cum', Thickness: '200mm' } })
  properties?: any;

  @ApiProperty({ example: '2026-07-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-10T10:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: 'model-111' })
  modelId: string;
}

export class BimModelResponseDto {
  @ApiProperty({ example: 'model-111' })
  id: string;

  @ApiProperty({ example: 'Bangalore Tech Park Block A' })
  name: string;

  @ApiPropertyOptional({ example: 'Structural Revit Model level design' })
  description?: string;

  @ApiProperty({ example: 'https://storage.buildtrace.in/models/bld-111_struc_v1.ifc' })
  fileUrl: string;

  @ApiProperty({ example: 'IFC' })
  fileType: string;

  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: 'COMPLETED' })
  status: string;

  @ApiPropertyOptional({ example: { crs: 'EPSG:3857', origin: [0, 0, 0], scale: 1.0 } })
  coordinateSystem?: any;

  @ApiPropertyOptional({ example: { author: 'Autodesk Revit 2024', levelsCount: 15 } })
  metadata?: any;

  @ApiProperty({ example: '2026-07-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-10T10:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z' })
  deletedAt?: Date;

  @ApiProperty({ example: 'proj-111' })
  projectId: string;

  @ApiPropertyOptional({ type: () => [BimElementResponseDto] })
  elements?: BimElementResponseDto[];
}

export class PaginatedBimModelResponseDto {
  @ApiProperty({ type: () => [BimModelResponseDto] })
  items: BimModelResponseDto[];

  @ApiProperty({
    example: {
      totalItems: 5,
      itemCount: 5,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    }
  })
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
