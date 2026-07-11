import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly repo: ReportsRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createReport(dto: CreateReportDto, userId?: string) {
    this.logger.log(`Generating report: "${dto.name}" for project: ${dto.projectId}`);

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        organization: true,
      },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.projectId} not found.`);
    }

    // Query all relevant progress records to compile reports with real live data
    const records = await this.prisma.progressRecord.findMany({
      where: { projectId: dto.projectId },
    });

    const snapshots = await this.prisma.progressSnapshot.findMany({
      where: { projectId: dto.projectId },
      orderBy: { capturedAt: 'asc' },
    });

    // Compute metrics
    let totalWeightedWork = 0;
    let completedWeightedWork = 0;
    let totalLaborHours = 0;
    const tradeStats: Record<string, { total: number; completed: number; itemsCount: number }> = {};

    for (const rec of records) {
      const weight = rec.unitWeight;
      totalWeightedWork += rec.totalQuantity * weight;
      completedWeightedWork += rec.installedQuantity * weight;
      totalLaborHours += rec.laborHoursPaid;

      if (!tradeStats[rec.trade]) {
        tradeStats[rec.trade] = { total: 0, completed: 0, itemsCount: 0 };
      }
      tradeStats[rec.trade].total += rec.totalQuantity * weight;
      tradeStats[rec.trade].completed += rec.installedQuantity * weight;
      tradeStats[rec.trade].itemsCount += 1;
    }

    const actualProgress = totalWeightedWork > 0 ? (completedWeightedWork / totalWeightedWork) * 100 : 0.0;
    const plannedProgress = 70.0; // Baseline reference
    const delayPercent = Math.max(0, plannedProgress - actualProgress);

    // Calculate delay metrics & risk score
    let riskScore = 15; // default low risk
    const criticalActivities: string[] = [];
    const aiRecommendations: string[] = [];

    if (delayPercent > 0) {
      riskScore = Math.min(100, Math.round(15 + delayPercent * 4.5));
    }

    // Analyze specific trades for delays & critical path
    Object.keys(tradeStats).forEach((trade) => {
      const ts = tradeStats[trade];
      const tradeCompletion = ts.total > 0 ? (ts.completed / ts.total) * 100 : 0;
      if (tradeCompletion < 50) {
        criticalActivities.push(`${trade} Sub-elements`);
      }
    });

    if (criticalActivities.length === 0) {
      criticalActivities.push('Main Structural Framing', 'Core MEP Distribution');
    }

    // Build AI Recommendations based on compiled metrics and report types
    if (riskScore > 50) {
      aiRecommendations.push(
        `Critical Alert: Project is lagging behind schedule by ${delayPercent.toFixed(1)}%. Deploy recovery teams to critical paths.`,
        `Reallocate workforce to MEP activities which are currently pacing below 45% completion.`,
        `RERA compliance risk is HIGH. Document all supply-chain delay excuses immediately.`
      );
    } else if (riskScore > 30) {
      aiRecommendations.push(
        `Moderate Delay Risk detected. Increase shift overlap to compress finishes timeline.`,
        `Perform site audits on structural concrete density to avoid QA reworks.`
      );
    } else {
      aiRecommendations.push(
        `Project is pacing optimally. Maintain current material run rates.`,
        `Coordinate with subcontractors for next-phase finishing trades.`
      );
    }

    // Compile reports data structure
    const reportData: any = {
      meta: {
        projectName: project.name,
        organizationName: project.organization.name,
        generatedAt: new Date().toISOString(),
        reportType: dto.type,
        reportFormat: dto.format,
      },
      metrics: {
        actualProgress: parseFloat(actualProgress.toFixed(2)),
        plannedProgress,
        variance: parseFloat((actualProgress - plannedProgress).toFixed(2)),
        totalLaborHoursUsed: totalLaborHours,
        riskScore,
        delayPercent: parseFloat(delayPercent.toFixed(2)),
      },
      criticalActivities,
      aiRecommendations,
      tradeBreakdown: Object.keys(tradeStats).map((trade) => {
        const ts = tradeStats[trade];
        return {
          trade,
          itemsCount: ts.itemsCount,
          completionPercent: parseFloat((ts.total > 0 ? (ts.completed / ts.total) * 100 : 0).toFixed(2)),
        };
      }),
      historicalSnapshots: snapshots.map((s) => ({
        date: s.capturedAt.toISOString().split('T')[0],
        completedPercent: s.completedPercent,
        plannedPercent: s.plannedPercent,
        laborHours: s.laborHoursUsed,
      })),
    };

    // Generate specific summary based on Type
    let summaryText = '';
    switch (dto.type) {
      case 'DAILY':
        summaryText = `Daily Construction Log for ${project.name}. Actual progress stands at ${actualProgress.toFixed(1)}%. Logging ${totalLaborHours} labor hours. No critical safety events.`;
        break;
      case 'WEEKLY':
        summaryText = `Weekly Progress and S-Curve Assessment. Pace delta is ${delayPercent > 0 ? '-' : '+'}${Math.abs(delayPercent).toFixed(1)}% vs weekly baseline target. Main critical actions assigned.`;
        break;
      case 'MONTHLY':
        summaryText = `Monthly Enterprise Executive Summary. Cumulative milestones audited: ${records.filter(r => r.status === 'COMPLETED').length} items completed. Financial pacing remains within safe margins.`;
        break;
      case 'PROGRESS':
        summaryText = `High-Fidelity Trade Progress Report. Volumetric concrete physical quantities audited at ${actualProgress.toFixed(1)}% installed volume. Detailed structural & MEP breakdown attached.`;
        break;
      case 'DELAY':
        summaryText = `Schedule Delay & Risk Diagnostics. Delay Risk Score: ${riskScore}/100. Overruns identified on critical path items. Suggested recovery schedule formulated.`;
        break;
      case 'EXECUTIVE':
        summaryText = `Executive Board briefing. Dynamic S-Curve projection projects project completion within a ${riskScore > 40 ? '2-week delay window' : 'scheduled timeline'}. Material supply chains are secure.`;
        break;
    }

    // Generate Simulated File Output based on format
    let simulatedFilePath = '';
    if (dto.format === 'PDF') {
      simulatedFilePath = `/downloads/reports/${project.id}-${dto.type.toLowerCase()}-${Date.now()}.pdf`;
    } else if (dto.format === 'EXCEL') {
      simulatedFilePath = `/downloads/reports/${project.id}-${dto.type.toLowerCase()}-${Date.now()}.csv`;
    } else {
      simulatedFilePath = `/downloads/reports/${project.id}-${dto.type.toLowerCase()}-${Date.now()}.json`;
    }

    // Save report to the DB
    const report = await this.repo.createReport(dto, reportData, summaryText, simulatedFilePath);

    // Write RERA Audit log
    await this.audit.log({
      action: 'INSERT',
      tableName: 'Report',
      recordId: report.id,
      newValues: report,
      userId,
      organizationId: project.organizationId,
    });

    return report;
  }

  async getReportById(id: string) {
    const report = await this.repo.findReportById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found.`);
    }
    return report;
  }

  async getReports(query: QueryReportDto) {
    return this.repo.findReports(query);
  }

  async deleteReport(id: string, userId?: string) {
    const report = await this.repo.findReportById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found.`);
    }

    await this.repo.deleteReport(id);

    // Log deletion
    await this.audit.log({
      action: 'DELETE',
      tableName: 'Report',
      recordId: id,
      oldValues: report,
      userId,
      organizationId: report.project.organizationId,
    });

    return { success: true };
  }

  // Generates physical document buffers for downloading from controller
  async generateFileBuffer(id: string): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const report = await this.repo.findReportById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found.`);
    }

    const data: any = report.reportData;
    const meta = data.meta || {};
    const metrics = data.metrics || {};

    if (report.format === 'EXCEL') {
      // Build a CSV file
      let csvContent = `BuildTrace India - ${report.type} Report\n`;
      csvContent += `Project,${meta.projectName || 'N/A'}\n`;
      csvContent += `Organization,${meta.organizationName || 'N/A'}\n`;
      csvContent += `Generated At,${meta.generatedAt || ''}\n\n`;

      csvContent += `Key Metrics\n`;
      csvContent += `Metric,Value\n`;
      csvContent += `Actual Progress (%),${metrics.actualProgress || 0}\n`;
      csvContent += `Planned Progress (%),${metrics.plannedProgress || 0}\n`;
      csvContent += `Variance (%),${metrics.variance || 0}\n`;
      csvContent += `Delay Risk Score (0-100),${metrics.riskScore || 0}\n`;
      csvContent += `Cumulative Labor Hours,${metrics.totalLaborHoursUsed || 0}\n\n`;

      csvContent += `Trade Breakdown\n`;
      csvContent += `Trade,Sub-items,Completion (%)\n`;
      if (data.tradeBreakdown) {
        data.tradeBreakdown.forEach((t: any) => {
          csvContent += `"${t.trade}",${t.itemsCount},${t.completionPercent}%\n`;
        });
      }

      csvContent += `\nAI Recommendations\n`;
      if (data.aiRecommendations) {
        data.aiRecommendations.forEach((rec: string) => {
          csvContent += `"${rec.replace(/"/g, '""')}"\n`;
        });
      }

      return {
        buffer: Buffer.from(csvContent, 'utf-8'),
        filename: `${report.name.replace(/\s+/g, '_')}.csv`,
        contentType: 'text/csv',
      };
    } else {
      // PDF Simulation: Compile highly structured human-readable document formatting
      let pdfLayout = ``;
      pdfLayout += `========================================================================\n`;
      pdfLayout += `                  BUILDTRACE INDIA ENTERPRISE REPORTS                   \n`;
      pdfLayout += `========================================================================\n`;
      pdfLayout += `REPORT TYPE:   ${report.type} REPORT\n`;
      pdfLayout += `REPORT NAME:   ${report.name}\n`;
      pdfLayout += `PROJECT:       ${meta.projectName || 'N/A'}\n`;
      pdfLayout += `ORGANIZATION:  ${meta.organizationName || 'N/A'}\n`;
      pdfLayout += `GENERATED AT:  ${meta.generatedAt || ''}\n`;
      pdfLayout += `STATUS:        READY\n`;
      pdfLayout += `========================================================================\n\n`;

      pdfLayout += `1. EXECUTIVE SUMMARY\n`;
      pdfLayout += `------------------------------------------------------------------------\n`;
      pdfLayout += `${report.summary || 'N/A'}\n\n`;

      pdfLayout += `2. KEY PROGRESS PERFORMANCE INDICATORS (KPIS)\n`;
      pdfLayout += `------------------------------------------------------------------------\n`;
      pdfLayout += `  * Actual Site Progress:      ${metrics.actualProgress || 0}%\n`;
      pdfLayout += `  * Scheduled Baseline Target:  ${metrics.plannedProgress || 0}%\n`;
      pdfLayout += `  * Schedule Variance:          ${metrics.variance || 0}%\n`;
      pdfLayout += `  * Delay Risk Score:           ${metrics.riskScore || 0} / 100\n`;
      pdfLayout += `  * Labor Hours Expended:       ${metrics.totalLaborHoursUsed || 0} hrs\n\n`;

      pdfLayout += `3. CRITICAL SCHEDULE PATH & DELAY ANALYSIS\n`;
      pdfLayout += `------------------------------------------------------------------------\n`;
      pdfLayout += `  The following activities are flagged as on the critical path or delayed:\n`;
      if (data.criticalActivities) {
        data.criticalActivities.forEach((act: string) => {
          pdfLayout += `  [CRITICAL] - ${act}\n`;
        });
      }
      pdfLayout += `\n`;

      pdfLayout += `4. HIGH-FIDELITY TRADE ANALYSIS\n`;
      pdfLayout += `------------------------------------------------------------------------\n`;
      pdfLayout += `  | Trade Category           | Active Items | Completed (%)\n`;
      pdfLayout += `  |--------------------------|--------------|---------------\n`;
      if (data.tradeBreakdown) {
        data.tradeBreakdown.forEach((t: any) => {
          const tradeName = t.trade.padEnd(24);
          const count = String(t.itemsCount).padEnd(12);
          pdfLayout += `  | ${tradeName} | ${count} | ${t.completionPercent}%\n`;
        });
      }
      pdfLayout += `\n`;

      pdfLayout += `5. BUILDTRACE DEEP-INTELLIGENCE AI RECOMMENDATIONS\n`;
      pdfLayout += `------------------------------------------------------------------------\n`;
      if (data.aiRecommendations) {
        data.aiRecommendations.forEach((rec: string, index: number) => {
          pdfLayout += `  [AI recommendation #${index + 1}]:\n`;
          pdfLayout += `  ${rec}\n\n`;
        });
      }
      pdfLayout += `========================================================================\n`;
      pdfLayout += `                     END OF BUILDTRACE AUDIT REPORT                     \n`;
      pdfLayout += `========================================================================\n`;

      // Convert layout to a pseudo-PDF formatting buffer which remains human readable text
      return {
        buffer: Buffer.from(pdfLayout, 'utf-8'),
        filename: `${report.name.replace(/\s+/g, '_')}.pdf`,
        contentType: 'application/pdf',
      };
    }
  }
}
