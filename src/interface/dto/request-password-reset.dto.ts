import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john@doe.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
