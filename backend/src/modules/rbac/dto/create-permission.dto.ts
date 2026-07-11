import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Length, Matches } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'The unique programmatic identifier key for the permission.',
    example: 'anomalies:create',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Permission name key is required.' })
  @Length(3, 100, { message: 'Permission name must be between 3 and 100 characters.' })
  @Matches(/^[a-z0-9_\-]+:[a-z0-9_\-*]+$/, {
    message: 'Permission name must follow standard colon syntax (e.g. "resource:action" or "resource:*").',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Readable description of actions granted by this key.',
    example: 'Provides privilege to log new visual concrete anomalies.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;
}
