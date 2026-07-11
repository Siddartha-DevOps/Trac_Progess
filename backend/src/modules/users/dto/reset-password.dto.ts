import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, Length } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Account email address for requesting recovery code.',
    example: 'engineer@buildtrace.in',
  })
  @IsEmail({}, { message: 'A valid email address is required.' })
  @IsNotEmpty({ message: 'Email address cannot be empty.' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Security reset token received via recovery email.',
    example: 'reset_token_f5e4d3c2',
  })
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required.' })
  token: string;

  @ApiProperty({
    description: 'The new secure password credential.',
    example: 'NewSuperSecurePass2026!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'New password cannot be blank.' })
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters.' })
  newPassword: string;
}
