import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier (UUID v4).',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  id: string;

  @ApiProperty({
    description: 'Corporate email address.',
    example: 'engineer@buildtrace.in',
  })
  email: string;

  @ApiProperty({
    description: 'First name.',
    example: 'Arjun',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name.',
    example: 'Sharma',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Contact phone number.',
    example: '+919876543210',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Profile avatar photo URL.',
    example: 'https://images.buildtrace.in/avatars/user-arjun.png',
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Account activation state.',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Access permission role.',
    example: 'SiteEngineer',
  })
  role: string;

  @ApiProperty({
    description: 'Email verification verified status.',
    example: false,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Phone verification verified status.',
    example: false,
  })
  isPhoneVerified: boolean;

  @ApiPropertyOptional({
    description: 'User layout and alert preferences block.',
    example: { theme: 'light', emailNotifications: true, smsNotifications: false },
  })
  preferences?: any;

  @ApiProperty({
    description: 'Has this user completed invitation onboarding.',
    example: true,
  })
  invitationAccepted: boolean;

  @ApiProperty({
    description: 'The enterprise organization GUID associated with this profile.',
    example: 'd9b0488e-67c4-4c4c-83b3-111122223333',
  })
  organizationId: string;

  @ApiProperty({
    description: 'Timestamp of profile registration.',
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
}

export class UserPaginationMetaDto {
  @ApiProperty({ description: 'Total quantity of users matching parameters.', example: 120 })
  totalItems: number;

  @ApiProperty({ description: 'Total records returned in current batch page.', example: 10 })
  itemCount: number;

  @ApiProperty({ description: 'User count displayed per page.', example: 10 })
  itemsPerPage: number;

  @ApiProperty({ description: 'Total computed pages.', example: 12 })
  totalPages: number;

  @ApiProperty({ description: 'Current active index.', example: 1 })
  currentPage: number;
}

export class PaginatedUserResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  items: UserResponseDto[];

  @ApiProperty({ type: UserPaginationMetaDto })
  meta: UserPaginationMetaDto;
}
