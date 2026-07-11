import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CompareBimModelsDto {
  @ApiProperty({
    description: 'The source or older BIM Model ID to compare.',
    example: 'model-uuid-v1',
  })
  @IsUUID('4', { message: 'Source Model ID must be a valid UUID.' })
  @IsNotEmpty({ message: 'Source Model ID is required.' })
  sourceModelId: string;

  @ApiProperty({
    description: 'The target or newer BIM Model ID to compare against.',
    example: 'model-uuid-v2',
  })
  @IsUUID('4', { message: 'Target Model ID must be a valid UUID.' })
  @IsNotEmpty({ message: 'Target Model ID is required.' })
  targetModelId: string;
}
