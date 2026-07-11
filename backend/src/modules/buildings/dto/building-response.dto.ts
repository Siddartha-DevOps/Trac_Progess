import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BuildingResponseDto {
  @ApiProperty({
    description: 'Unique building identifier (UUID v4).',
    example: 'b1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  id: string;

  @ApiProperty({
    description: 'The structural name of the building.',
    example: 'Tower A',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the building scope.',
    example: 'Residential block with integrated community hall.',
  })
  description?: string;

  @ApiProperty({
    description: 'Usage classification of the building.',
    example: 'RESIDENTIAL',
  })
  type: string;

  @ApiProperty({
    description: 'Current construction status.',
    example: 'UNDER_CONSTRUCTION',
  })
  status: string;

  @ApiProperty({
    description: 'Total number of floors above ground.',
    example: 14,
  })
  floors: number;

  @ApiProperty({
    description: 'Total number of basement floors.',
    example: 2,
  })
  basementFloors: number;

  @ApiProperty({
    description: 'Total square foot or square meter area.',
    example: 75000.5,
  })
  totalArea: number;

  @ApiProperty({
    description: 'Allocated vehicle parking spaces.',
    example: 120,
  })
  parkingSpaces: number;

  @ApiPropertyOptional({
    description: 'Custom metadata parameters.',
    example: { constructionMethod: 'Precast Concrete' },
  })
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Physical building address.',
    example: 'Plot No 23, Electronic City Phase 1',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'City.',
    example: 'Bangalore',
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'State.',
    example: 'Karnataka',
  })
  state?: string;

  @ApiPropertyOptional({
    description: 'Postal zip or pin code.',
    example: '560100',
  })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'GPS coordinate - Latitude.',
    example: 12.8456,
  })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'GPS coordinate - Longitude.',
    example: 77.6632,
  })
  longitude?: number;

  @ApiProperty({
    description: 'Registration timestamp.',
    example: '2026-07-10T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-07-10T12:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Timestamp of soft-delete deactivation.',
  })
  deletedAt?: Date;

  @ApiProperty({
    description: 'The unique parent project ID (UUID v4) owning this building.',
    example: 'd1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  projectId: string;
}

export class BuildingPaginationMetaDto {
  @ApiProperty({ description: 'Total quantity of records matching parameters.', example: 10 })
  totalItems: number;

  @ApiProperty({ description: 'Total records returned in current batch page.', example: 10 })
  itemCount: number;

  @ApiProperty({ description: 'Item count displayed per page.', example: 10 })
  itemsPerPage: number;

  @ApiProperty({ description: 'Total computed pages.', example: 1 })
  totalPages: number;

  @ApiProperty({ description: 'Current active page index (1-indexed).', example: 1 })
  currentPage: number;
}

export class PaginatedBuildingResponseDto {
  @ApiProperty({ type: [BuildingResponseDto] })
  items: BuildingResponseDto[];

  @ApiProperty({ type: BuildingPaginationMetaDto })
  meta: BuildingPaginationMetaDto;
}
