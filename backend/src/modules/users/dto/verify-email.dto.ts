import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Unique validation token sent to user email.',
    example: 'email_token_v9b8n7m6',
  })
  @IsString()
  @IsNotEmpty({ message: 'Verification token is required.' })
  token: string;
}
