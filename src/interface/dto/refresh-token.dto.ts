import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token of the user',
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({
    description: 'The current access token to blacklist (optional)',
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  accessToken?: string;
}
