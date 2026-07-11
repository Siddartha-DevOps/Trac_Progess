import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, IsOptional, Length, IsUUID, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique corporate email address of the construction operator.',
    example: 'engineer@buildtrace.in',
  })
  @IsEmail({}, { message: 'A valid email address is required.' })
  @IsNotEmpty({ message: 'Email cannot be blank.' })
  email: string;

  @ApiProperty({
    description: 'First name of the user.',
    example: 'Arjun',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required.' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters.' })
  firstName: string;

  @ApiProperty({
    description: 'Last name/Surname of the user.',
    example: 'Sharma',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required.' })
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters.' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Strong password credential. Can be left empty if creating via email invitation.',
    example: 'K7#pX9$mLw2q',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters.' })
  password?: string;

  @ApiProperty({
    description: 'The physical organization GUID associated with this user.',
    example: 'd9b0488e-67c4-4c4c-83b3-111122223333',
  })
  @IsUUID('4', { message: 'organizationId must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'Organization association is required.' })
  organizationId: string;

  @ApiProperty({
    description: 'System privilege level.',
    example: 'SiteEngineer',
    enum: ['Admin', 'SiteEngineer', 'Auditor'],
  })
  @IsString()
  @IsNotEmpty({ message: 'Role designation is required.' })
  @Matches(/^(Admin|SiteEngineer|Auditor)$/, {
    message: 'Role must be either Admin, SiteEngineer, or Auditor.',
  })
  role: string;

  @ApiPropertyOptional({
    description: 'Mobile contact number with optional country prefix.',
    example: '+919876543210',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'PhoneNumber must conform to international E.164 specifications.',
  })
  phoneNumber?: string;
}
