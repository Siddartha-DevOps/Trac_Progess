import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FloorResponseDto {
  @ApiProperty({
    description: 'Unique floor identifier (UUID v4).',
    example: 'f1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  id: string;

  @ApiProperty({
    description: 'The vertical designation name of the floor.',
    example: 'Ground Floor',
  })
  name: string;

  @ApiProperty({
    description: 'Vertical level index. E.g., 0 for ground, 1 for first floor, -1 for basement.',
    example: 0,
  })
  number: number;

  @ApiProperty({
    description: 'Sort or execution index order for lists and sequences.',
    example: 0,
  })
  order: number;

  @ApiPropertyOptional({
    description: 'Detailed description of the floor construction scope.',
    example: 'Ground floor featuring standard lobby and structural support columns.',
  })
  description?: string;

  @ApiProperty({
    description: 'Total area of the level (sqft or sqm).',
    example: 4500.5,
  })
  totalArea: number;

  @ApiProperty({
    description: 'Current construction status.',
    example: 'UNDER_CONSTRUCTION',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Extensible JSON block for custom attributes or specifications.',
    example: { structuralCheckCompleted: true, inspectorSignature: 'Rajesh Kumar' },
  })
  metadata?: any;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2026-07-10T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-07-10T12:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Soft-delete deactivation timestamp.',
  })
  deletedAt?: Date;

  @ApiProperty({
    description: 'Unique parent building ID (UUID v4) owning this floor.',
    example: 'b1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  buildingId: string;
}

export class FloorPaginationMetaDto {
  @ApiProperty({ description: 'Total records matching query filters.', example: 12 })
  totalItems: number;

  @ApiProperty({ description: 'Total records returned in current page.', example: 10 })
  itemCount: number;

  @ApiProperty({ description: 'Count of records displayed per page.', example: 10 })
  itemsPerPage: number;

  @ApiProperty({ description: 'Total computed pages.', example: 2 })
  totalPages: number;

  @ApiProperty({ description: 'Current active page index.', example: 1 })
  currentPage: number;
}

export class PaginatedFloorResponseDto {
  @ApiProperty({ type: [FloorResponseDto] })
  items: FloorResponseDto[];

  @ApiProperty({ type: FloorPaginationMetaDto })
  meta: FloorPaginationMetaDto;
}
