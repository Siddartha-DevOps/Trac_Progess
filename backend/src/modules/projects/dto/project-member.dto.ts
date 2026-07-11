import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsIn } from 'class-validator';

export class AddProjectMemberDto {
  @ApiProperty({
    description: 'Unique user identifier (UUID v4) to be added as a member.',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  @IsUUID('4', { message: 'userId must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'User ID is required.' })
  userId: string;

  @ApiProperty({
    description: 'Access role of the member within the scope of this project.',
    example: 'MEMBER',
    enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'],
  })
  @IsString()
  @IsNotEmpty({ message: 'Role designation is required.' })
  @IsIn(['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'], {
    message: 'Role must be one of: OWNER, MANAGER, MEMBER, VIEWER',
  })
  role: string;
}

export class UpdateProjectMemberDto {
  @ApiProperty({
    description: 'Updated role clearance level for this project member.',
    example: 'MANAGER',
    enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'],
  })
  @IsString()
  @IsNotEmpty({ message: 'Role designation is required.' })
  @IsIn(['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'], {
    message: 'Role must be one of: OWNER, MANAGER, MEMBER, VIEWER',
  })
  role: string;
}

export class ProjectMemberResponseDto {
  @ApiProperty({ description: 'The unique ID of the project.' })
  projectId: string;

  @ApiProperty({ description: 'The unique ID of the user.' })
  userId: string;

  @ApiProperty({ description: 'Project-specific user role clearance.', example: 'MANAGER' })
  role: string;

  @ApiProperty({ description: 'Timestamp of project enrollment.' })
  joinedAt: Date;

  @ApiPropertyOptional({
    description: 'User details if populated.',
    example: { firstName: 'Arjun', lastName: 'Sharma', email: 'arjun@buildtrace.in' },
  })
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
