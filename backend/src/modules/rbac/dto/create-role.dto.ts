import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Length, Matches } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Unique corporate name of the security privilege role.',
    example: 'SiteEngineer',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Role name cannot be empty.' })
  @Length(3, 50, { message: 'Role name must be between 3 and 50 characters.' })
  @Matches(/^[a-zA-Z0-9_\-]+$/, {
    message: 'Role name must contain only letters, numbers, underscores, and hyphens.',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the role responsibilities.',
    example: 'Operates field checklists, registers visual site logs, and raises anomalies.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;
}
