import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class RequestPhoneVerificationDto {
  @ApiProperty({
    description: 'Target mobile phone number to send verification SMS/OTP code.',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required.' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'PhoneNumber must conform to international E.164 specifications.',
  })
  phoneNumber: string;
}

export class VerifyPhoneDto {
  @ApiProperty({
    description: 'The mobile phone number being verified.',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required.' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'PhoneNumber must conform to international E.164 specifications.',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'The numeric OTP code received on the mobile phone.',
    example: '554321',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'SMS verification code is required.' })
  @Length(6, 6, { message: 'SMS verification OTP must be exactly 6 characters.' })
  code: string;
}
