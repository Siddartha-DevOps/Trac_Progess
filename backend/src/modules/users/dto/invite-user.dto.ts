import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, IsUUID, Matches, Length } from 'class-validator';

export class InviteUserDto {
  @ApiProperty({
    description: 'Email address of the invitee.',
    example: 'new-engineer@buildtrace.in',
  })
  @IsEmail({}, { message: 'A valid email address is required.' })
  @IsNotEmpty({ message: 'Email is required for invitation.' })
  email: string;

  @ApiProperty({
    description: 'First name of the invitee.',
    example: 'Rohan',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required.' })
  @Length(2, 50)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the invitee.',
    example: 'Verma',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required.' })
  @Length(2, 50)
  lastName: string;

  @ApiProperty({
    description: 'Privilege clearance role for the invitee.',
    example: 'SiteEngineer',
    enum: ['Admin', 'SiteEngineer', 'Auditor'],
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(Admin|SiteEngineer|Auditor)$/, {
    message: 'Role must be either Admin, SiteEngineer, or Auditor.',
  })
  role: string;

  @ApiProperty({
    description: 'The company organization GUID initiating this user invitation.',
    example: 'd9b0488e-67c4-4c4c-83b3-111122223333',
  })
  @IsUUID('4')
  @IsNotEmpty()
  organizationId: string;
}

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'The secure invitation registration token received via email.',
    example: 'invite_token_a7b8c9d0',
  })
  @IsString()
  @IsNotEmpty({ message: 'Invitation token is required.' })
  token: string;

  @ApiProperty({
    description: 'Set a new password to complete registration.',
    example: 'SecurePass987#',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'A secure password must be specified.' })
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters.' })
  password: string;
}
