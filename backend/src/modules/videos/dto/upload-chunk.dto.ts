import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadChunkDto {
  @ApiProperty({
    description: 'The 0-based index of the chunk being uploaded.',
    example: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Chunk index must be a non-negative integer.' })
  chunkIndex: number;

  @ApiProperty({
    description: 'The total number of chunks expected for this session.',
    example: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Total chunks must be at least 1.' })
  totalChunks: number;
}
