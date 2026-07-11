import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty({
    description: 'Unique UUID tracking this organization tenant.',
    example: 'd9b0488e-67c4-4c4c-83b3-111122223333',
  })
  id: string;

  @ApiProperty({
    description: 'Corporate entity legal name.',
    example: 'Larsen & Toubro Realty',
  })
  name: string;

  @ApiProperty({
    description: 'URL slug parameter.',
    example: 'lt-realty',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'RERA audit license code.',
    example: 'PRM/KA/RERA/1251/446/PR/181122/002187',
  })
  reraLicense?: string;

  @ApiProperty({
    description: 'Timestamp of registration.',
    example: '2026-07-10T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp of last details update.',
    example: '2026-07-10T12:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Deleted timestamp if record was soft-deleted.',
    example: '2026-07-10T16:00:00.000Z',
  })
  deletedAt?: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total records matching query filters.', example: 45 })
  totalItems: number;

  @ApiProperty({ description: 'Amount of items returned on the current page.', example: 10 })
  itemCount: number;

  @ApiProperty({ description: 'Items displayed per page constraint.', example: 10 })
  itemsPerPage: number;

  @ApiProperty({ description: 'Total quantity of pages.', example: 5 })
  totalPages: number;

  @ApiProperty({ description: 'Current active page.', example: 1 })
  currentPage: number;
}

export class PaginatedOrganizationResponseDto {
  @ApiProperty({ type: [OrganizationResponseDto] })
  items: OrganizationResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
