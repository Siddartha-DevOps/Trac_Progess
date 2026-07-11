import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, Matches } from 'class-validator';

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional({
    description: 'The preferred system layout color scheme.',
    example: 'dark',
    enum: ['light', 'dark'],
  })
  @IsString()
  @IsOptional()
  @Matches(/^(light|dark)$/, { message: 'Theme must be light or dark.' })
  theme?: string;

  @ApiPropertyOptional({
    description: 'Toggle flag for weekly PDF system progress reports.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({
    description: 'Toggle flag for critical site anomaly SMS alerts.',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @ApiPropertyOptional({
    description: 'Preferred dashboard local culture and language preset.',
    example: 'en-IN',
  })
  @IsString()
  @IsOptional()
  language?: string;
}
