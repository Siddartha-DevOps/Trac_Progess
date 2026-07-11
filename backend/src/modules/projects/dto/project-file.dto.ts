import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsUrl } from 'class-validator';

export class CreateProjectFileDto {
  @ApiProperty({
    description: 'The literal name of the uploaded document or model.',
    example: 'revit_structural_foundation_v3.rvt',
  })
  @IsString()
  @IsNotEmpty({ message: 'File name is required.' })
  name: string;

  @ApiProperty({
    description: 'The storage locator URL (e.g. S3, Cloud Storage, or localized CDN link).',
    example: 'https://storage.buildtrace.in/projects/files/revit_structural_foundation_v3.rvt',
  })
  @IsUrl({}, { message: 'url must be a valid resource link URL.' })
  @IsNotEmpty({ message: 'File url locator is required.' })
  url: string;

  @ApiProperty({
    description: 'Size of the uploaded file in bytes.',
    example: 24590211,
  })
  @IsInt({ message: 'size must be an integer value representing bytes.' })
  @Min(0, { message: 'size cannot be negative.' })
  size: number;

  @ApiPropertyOptional({
    description: 'programmatic MIME-type identifier of the file.',
    example: 'application/octet-stream',
  })
  @IsString()
  @IsOptional()
  mimeType?: string;
}

export class ProjectFileResponseDto {
  @ApiProperty({ description: 'Unique file GUID.' })
  id: string;

  @ApiProperty({ description: 'File name.' })
  name: string;

  @ApiProperty({ description: 'File download/access URL.' })
  url: string;

  @ApiProperty({ description: 'File size in bytes.', example: 502910 })
  size: number;

  @ApiPropertyOptional({ description: 'MIME type of the resource.', example: 'application/pdf' })
  mimeType?: string;

  @ApiProperty({ description: 'The parent project ID.' })
  projectId: string;

  @ApiPropertyOptional({ description: 'The ID of the user who performed the upload.' })
  uploadedById?: string;

  @ApiProperty({ description: 'Registration timestamp.' })
  createdAt: Date;

  @ApiProperty({ description: 'Last detail modification timestamp.' })
  updatedAt: Date;
}
