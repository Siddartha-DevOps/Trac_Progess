import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryProgressDto {
  @ApiProperty({ description: 'Filter by Project ID', required: false })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: 'Filter by Building ID', required: false })
  @IsString()
  @IsOptional()
  buildingId?: string;

  @ApiProperty({ description: 'Filter by Floor ID', required: false })
  @IsString()
  @IsOptional()
  floorId?: string;

  @ApiProperty({ description: 'Filter by Trade category', required: false })
  @IsString()
  @IsOptional()
  trade?: string;

  @ApiProperty({ description: 'Page index for pagination', required: false, default: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Result batch limits', required: false, default: 10 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}
