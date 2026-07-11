import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Unique template system identifier name', example: 'PROGRESS_ALERT' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The subject line of the notification', example: 'Alert: Progress Delay on Project {{projectName}}' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Body text supporting variable interpolation syntax like {{var}}', example: 'Hello, the project {{projectName}} has a delay risk.' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ description: 'Comma-separated channels supported', example: 'EMAIL,SMS,PUSH,IN_APP' })
  @IsString()
  @IsNotEmpty()
  channels: string;
}
