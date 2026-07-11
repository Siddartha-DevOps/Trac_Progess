import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({
    description: 'Unique room identifier (UUID v4).',
    example: 'r1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  id: string;

  @ApiProperty({
    description: 'The vertical identification name of the room.',
    example: 'Office 101',
  })
  name: string;

  @ApiProperty({
    description: 'Room Category classification.',
    example: 'OFFICE',
  })
  category: string;

  @ApiProperty({
    description: 'Current construction or commissioning status.',
    example: 'UNDER_CONSTRUCTION',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the room.',
    example: 'Corner office room with dual-aspect window frames and integrated electrical conduits.',
  })
  description?: string;

  @ApiProperty({
    description: 'Total floor area (sqft or sqm).',
    example: 180.5,
  })
  totalArea: number;

  @ApiProperty({
    description: 'Ceiling height.',
    example: 9.5,
  })
  height: number;

  @ApiProperty({
    description: 'Perimeter bounds length.',
    example: 54.0,
  })
  perimeter: number;

  @ApiPropertyOptional({
    description: 'Structural geometry data describing polygon layouts or coordinates.',
    example: { type: 'Polygon', coordinates: [[[0, 0], [0, 15], [12, 15], [12, 0], [0, 0]]] },
  })
  geometry?: any;

  @ApiPropertyOptional({
    description: 'Extensible JSON block for custom attributes, hardware lists, or custom parameters.',
    example: { fixturesCount: 6, keyCardAccess: true },
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
    description: 'Unique parent floor ID (UUID v4) containing this room.',
    example: 'f1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  floorId: string;
}

export class RoomPaginationMetaDto {
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

export class PaginatedRoomResponseDto {
  @ApiProperty({ type: [RoomResponseDto] })
  items: RoomResponseDto[];

  @ApiProperty({ type: RoomPaginationMetaDto })
  meta: RoomPaginationMetaDto;
}
