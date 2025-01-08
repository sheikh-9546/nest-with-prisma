import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The request token of the user',
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  token: string; // The reset token passed in the request

  @ApiProperty({
    description: 'The new password of the user',
    example: 'Test@123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8) // Ensure password has a minimum length for security
  newPassword: string;
}
