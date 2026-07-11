import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Matches, Length } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'The legal corporate entity name of the construction developer.',
    example: 'Larsen & Toubro Realty',
    minLength: 3,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required.' })
  @Length(3, 150, { message: 'Organization name must be between 3 and 150 characters.' })
  name: string;

  @ApiProperty({
    description: 'A URL-friendly lowercase slug identifier for tenant subdomains.',
    example: 'lt-realty',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Slug identifier is required.' })
  @Length(3, 50, { message: 'Slug must be between 3 and 50 characters.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must consist only of lowercase letters, numbers, and dashes.',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Official Indian RERA License Identification code.',
    example: 'PRM/KA/RERA/1251/446/PR/181122/002187',
  })
  @IsString()
  @IsOptional()
  @Length(5, 100, { message: 'RERA License string must be between 5 and 100 characters.' })
  reraLicense?: string;
}
