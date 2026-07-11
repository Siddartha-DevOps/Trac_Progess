import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';
import { Response } from 'express';

@ApiTags('Reports Module')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-user-id',
  description: 'Simulated User ID for dev testing',
  required: false,
})
@ApiHeader({
  name: 'x-user-role',
  description: 'Simulated User Role (Admin, SiteEngineer, Auditor)',
  required: false,
})
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('write:reports')
  @ApiOperation({ summary: 'Generate progress, delay, daily, weekly, monthly or executive audit reports' })
  @ApiResponse({ status: 201, description: 'Report successfully created, audited and archived' })
  async createReport(@Body() dto: CreateReportDto, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.createReport(dto, userId);
  }

  @Get()
  @Permissions('read:reports')
  @ApiOperation({ summary: 'Filter and browse historical generated reports' })
  @ApiResponse({ status: 200, description: 'Page of reports returned' })
  async getReports(@Query() query: QueryReportDto) {
    return this.service.getReports(query);
  }

  @Get(':id')
  @Permissions('read:reports')
  @ApiOperation({ summary: 'Fetch detail metrics and full JSON structure of a report' })
  @ApiParam({ name: 'id', description: 'Report UUID' })
  @ApiResponse({ status: 200, description: 'Full Report payload returned' })
  async getReportById(@Param('id') id: string) {
    return this.service.getReportById(id);
  }

  @Get(':id/download')
  @Permissions('read:reports')
  @ApiOperation({ summary: 'Download physical PDF/Excel binary sheets compiled dynamically' })
  @ApiParam({ name: 'id', description: 'Report UUID' })
  @ApiResponse({ status: 200, description: 'File binary stream successfully served' })
  async downloadReportFile(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename, contentType } = await this.service.generateFileBuffer(id);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Delete(':id')
  @Permissions('write:reports')
  @ApiOperation({ summary: 'Purge a historical generated report from archiving logs' })
  @ApiParam({ name: 'id', description: 'Report UUID' })
  @ApiResponse({ status: 200, description: 'Report successfully deleted and audited' })
  async deleteReport(@Param('id') id: string, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.deleteReport(id, userId);
  }
}
