import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'Updated descriptive explanation of role duties.',
    example: 'Authorized site quality auditor, with permission to log critical failures.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;
}
