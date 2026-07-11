import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryNotificationDto {
  @ApiProperty({ description: 'Filter by channel', required: false, example: 'EMAIL' })
  @IsString()
  @IsOptional()
  channel?: string;

  @ApiProperty({ description: 'Filter by status (PENDING, SENT, FAILED)', required: false, example: 'FAILED' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Filter by associated Project ID', required: false, example: 'proj-123' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: 'Filter by recipient user ID', required: false, example: 'user-123' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Page index', required: false, default: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items limit per page', required: false, default: 10 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}
