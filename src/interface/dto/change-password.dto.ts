import { Messages } from '@api/constants/messages';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The current password of the user',
    example: 'Test@123',
  })
  @IsString({ message: Messages.User.Validation.PASSWORD_REQUIRED })
  @IsNotEmpty({ message: Messages.User.Validation.PASSWORD_REQUIRED })
  currentPassword: string;

  @ApiProperty({
    description: 'The new password of the user',
    example: 'Test@1234',
  })
  @IsString({ message: Messages.User.Validation.PASSWORD_REQUIRED })
  @IsNotEmpty({ message: Messages.User.Validation.PASSWORD_REQUIRED })
  @MinLength(8, { message: Messages.User.Validation.PASSWORD_MIN_LENGTH })
  newPassword: string;
}
