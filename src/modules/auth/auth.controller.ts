import { Controller, Body } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from '@api/interface/dto/login.dto';
import { PostMapping, RestController } from '@api/core/decorators/http-mapping.decorator';
import { RefreshTokenDto } from '@api/interface/dto/refresh-token.dto';
import { RequestPasswordResetDto } from '@api/interface/dto/request-password-reset.dto';
import { ResetPasswordDto } from '@api/interface/dto/reset-password.dto';

@RestController({ path: 'auth', tag: 'Auth' })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PostMapping({ path: 'login', summary: 'Allow to user Login' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @PostMapping({ path: 'refresh-token',summary: 'Allow to refresh Token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const newTokens = await this.authService.refreshTokens(refreshTokenDto.refreshToken);
    return newTokens;
  }

  @PostMapping({ path: 'forgot-password',summary: 'Allow to forgot Password' })
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return await this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @PostMapping({ path: 'reset-password',summary: 'Allow to reset Password' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }

}
