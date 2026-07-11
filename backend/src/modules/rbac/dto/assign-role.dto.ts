import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'Unique identifier (UUID) of the target user.',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  @IsUUID('4', { message: 'userId must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'User ID is required.' })
  userId: string;

  @ApiProperty({
    description: 'The name string or UUID of the privilege role being assigned.',
    example: 'SiteEngineer',
  })
  @IsString()
  @IsNotEmpty({ message: 'Role designation is required.' })
  roleName: string;
}
