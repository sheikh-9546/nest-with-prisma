import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john@doe.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Test@123',
  })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}
