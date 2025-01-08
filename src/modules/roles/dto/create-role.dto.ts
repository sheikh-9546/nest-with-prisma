import { Role } from '@api/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    enum: Role,
    example: Role.ADMIN,
  })
  @IsString()
  @IsNotEmpty()
  roleName: string;
}
