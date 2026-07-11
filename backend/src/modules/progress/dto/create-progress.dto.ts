import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProgressDto {
  @ApiProperty({ description: 'Unique Project ID' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'Optional Building ID', required: false })
  @IsString()
  @IsOptional()
  buildingId?: string;

  @ApiProperty({ description: 'Optional Floor ID', required: false })
  @IsString()
  @IsOptional()
  floorId?: string;

  @ApiProperty({ description: 'Optional Room ID', required: false })
  @IsString()
  @IsOptional()
  roomId?: string;

  @ApiProperty({ description: 'Trade category classification', example: 'Structural' })
  @IsString()
  @IsNotEmpty()
  trade: string; // e.g., Structural, MEP, Finishes, Exterior

  @ApiProperty({ description: 'Sub-item element name', example: 'Steel Reinforcement' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ description: 'Installed physical quantity', default: 0 })
  @IsNumber()
  @Min(0)
  installedQuantity: number;

  @ApiProperty({ description: 'Total planned physical quantity to install', default: 100 })
  @IsNumber()
  @Min(0.01)
  totalQuantity: number;

  @ApiProperty({ description: 'Unit of measurement', default: 'm³' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Complexity weighting factor in overall composite calculations', default: 1.0 })
  @IsNumber()
  @Min(0.1)
  unitWeight: number;

  @ApiProperty({ description: 'Labor hours paid or logged for this specific element', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  laborHoursPaid?: number;

  @ApiProperty({ description: 'Planned duration days to complete this trade element', default: 30 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  plannedDays?: number;

  @ApiProperty({ description: 'Current task completion status', default: 'PLANNING' })
  @IsString()
  @IsOptional()
  status?: string; // e.g. PLANNING, UNDER_CONSTRUCTION, COMPLETED
}

export class CreateSnapshotDto {
  @ApiProperty({ description: 'Unique Project ID' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'Optional Building ID', required: false })
  @IsString()
  @IsOptional()
  buildingId?: string;

  @ApiProperty({ description: 'Completed percentage overall', default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  completedPercent: number;

  @ApiProperty({ description: 'Planned percentage according to baseline schedule', default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  plannedPercent: number;

  @ApiProperty({ description: 'Total weekly pace delta percentage points', default: 0 })
  @IsNumber()
  @IsOptional()
  paceWeeklyDelta?: number;

  @ApiProperty({ description: 'Cumulative labor hours logged for the period', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  laborHoursUsed?: number;
}
