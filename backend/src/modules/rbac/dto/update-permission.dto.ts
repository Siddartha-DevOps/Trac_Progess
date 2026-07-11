import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    description: 'Updated descriptive explanation of access.',
    example: 'Provides privilege to log new visual concrete anomalies and edit current status.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;
}
