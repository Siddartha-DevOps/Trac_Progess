import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({
    description: 'Unique permission identifier (UUID v4).',
    example: 'p1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  id: string;

  @ApiProperty({
    description: 'Programmatic permission key identifier.',
    example: 'anomalies:create',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the permission.',
    example: 'Provides privilege to log new visual concrete anomalies.',
  })
  description?: string;

  @ApiProperty({
    description: 'Timestamp of permission registration.',
    example: '2026-07-10T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp of last details modification.',
    example: '2026-07-10T12:30:00.000Z',
  })
  updatedAt: Date;
}

export class RoleResponseDto {
  @ApiProperty({
    description: 'Unique role identifier (UUID v4).',
    example: 'r1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  id: string;

  @ApiProperty({
    description: 'Privilege role name.',
    example: 'SiteEngineer',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descriptive explanation of role duties.',
    example: 'Operates field checklists, registers visual site logs, and raises anomalies.',
  })
  description?: string;

  @ApiProperty({
    description: 'Timestamp of role registration.',
    example: '2026-07-10T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp of last details modification.',
    example: '2026-07-10T12:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Soft deactivation/deletion timestamp.',
    example: '2026-07-10T16:00:00.000Z',
  })
  deletedAt?: Date;

  @ApiPropertyOptional({
    description: 'Associated permission keys assigned to this role.',
    type: [PermissionResponseDto],
  })
  permissions?: PermissionResponseDto[];
}

export class RbacPaginationMetaDto {
  @ApiProperty({ description: 'Total quantity of records matching parameters.', example: 10 })
  totalItems: number;

  @ApiProperty({ description: 'Total records returned in current batch page.', example: 10 })
  itemCount: number;

  @ApiProperty({ description: 'Item count displayed per page.', example: 10 })
  itemsPerPage: number;

  @ApiProperty({ description: 'Total computed pages.', example: 1 })
  totalPages: number;

  @ApiProperty({ description: 'Current active index.', example: 1 })
  currentPage: number;
}

export class PaginatedRoleResponseDto {
  @ApiProperty({ type: [RoleResponseDto] })
  items: RoleResponseDto[];

  @ApiProperty({ type: RbacPaginationMetaDto })
  meta: RbacPaginationMetaDto;
}

export class PaginatedPermissionResponseDto {
  @ApiProperty({ type: [PermissionResponseDto] })
  items: PermissionResponseDto[];

  @ApiProperty({ type: RbacPaginationMetaDto })
  meta: RbacPaginationMetaDto;
}

export class AssignmentResponseDto {
  @ApiProperty({ description: 'Verification check indicating assignment success.', example: true })
  success: boolean;

  @ApiProperty({ description: 'Detailed confirmation feedback message.', example: 'Assigned 3 permissions to role Admin successfully.' })
  message: string;
}
