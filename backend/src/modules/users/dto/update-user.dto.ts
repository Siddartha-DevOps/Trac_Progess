import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Updated first name of the user.',
    example: 'Arjun',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters.' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Updated last name of the user.',
    example: 'Sharma',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters.' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Updated mobile phone number.',
    example: '+919876543211',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'PhoneNumber must conform to international E.164 specifications.',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'User avatar image URL link.',
    example: 'https://images.buildtrace.in/avatars/user-arjun.png',
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Active status of the user profile.',
    example: true,
  })
  isActive?: boolean;
}
