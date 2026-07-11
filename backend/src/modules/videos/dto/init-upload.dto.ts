import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Length, IsUUID, IsBoolean, IsInt, Min } from 'class-validator';

export class InitUploadDto {
  @ApiProperty({
    description: 'The name of the video.',
    example: 'Tower A Drone Concrete Inspection',
  })
  @IsString()
  @IsNotEmpty({ message: 'Video name is required.' })
  @Length(2, 150, { message: 'Video name must be between 2 and 150 characters.' })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the video content or scan context.',
    example: 'High-resolution drone flyby over the main structural columns of Tower A level 12.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @ApiProperty({
    description: 'The total size of the video file in bytes.',
    example: 104857600, // 100MB
  })
  @IsInt()
  @Min(1, { message: 'File size must be greater than 0.' })
  fileSize: number;

  @ApiProperty({
    description: 'Mime type of the video file.',
    example: 'video/mp4',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mime type is required.' })
  mimeType: string;

  @ApiProperty({
    description: 'Associated project ID.',
    example: 'proj-111',
  })
  @IsUUID('4', { message: 'Project ID must be a valid UUID.' })
  @IsNotEmpty({ message: 'Project ID is required.' })
  projectId: string;

  @ApiPropertyOptional({
    description: 'Flag indicating if the video is a 360-degree immersive format.',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is360?: boolean = false;
}
