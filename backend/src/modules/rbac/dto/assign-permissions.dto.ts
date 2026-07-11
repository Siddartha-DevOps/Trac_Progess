import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'Array of unique permission names or IDs to associate with the target role.',
    example: ['anomalies:create', 'anomalies:read', 'reports:create'],
  })
  @IsArray({ message: 'Permissions must be a list array.' })
  @IsString({ each: true, message: 'Each permission element must be a string key.' })
  @IsNotEmpty({ message: 'Permissions list cannot be blank.' })
  permissions: string[];
}
