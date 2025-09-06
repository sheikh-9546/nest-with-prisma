import { Controller, Body, Headers, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from '@api/interface/dto/login.dto';
import { PostMapping, RestController } from '@api/core/decorators/http-mapping.decorator';
import { RefreshTokenDto } from '@api/interface/dto/refresh-token.dto';
import { RequestPasswordResetDto } from '@api/interface/dto/request-password-reset.dto';
import { ResetPasswordDto } from '@api/interface/dto/reset-password.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@RestController({ path: 'auth', tag: 'Auth' })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PostMapping({ path: 'login', summary: 'Allow to user Login' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @PostMapping({ path: 'google/login', summary: 'Login with Google account' })
  async googleLogin(@Body() { token }: { token: string }) {
    return this.authService.googleLogin(token);
  }

  @PostMapping({ path: 'facebook/login', summary: 'Login with Facebook account' })
  async facebookLogin(@Body() { accessToken }: { accessToken: string }) {
    return this.authService.facebookLogin(accessToken);
  }

  @PostMapping({ path: 'refresh-token',summary: 'Allow to refresh Token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshTokens(
      refreshTokenDto.refreshToken, 
      refreshTokenDto.accessToken // Optional old token for blacklisting
    );
  }

  @PostMapping({ path: 'forgot-password',summary: 'Allow to forgot Password' })
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return await this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @PostMapping({ path: 'reset-password',summary: 'Allow to reset Password' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @PostMapping({ path: 'logout', summary: 'Logout from current device' })
  async logout(@Request() req: any) {
    // The JWT Guard already validated the token and provides user info
    const userId = req.user.id;
    const tokenId = req.user.jti; // JWT ID from the validated token
    
    return await this.authService.logoutByUserId(userId, tokenId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @PostMapping({ path: 'logout-all', summary: 'Logout from all devices' })
  async logoutFromAllDevices(@Request() req: any) {
    const userId = req.user.id;
    return await this.authService.logoutFromAllDevices(userId);
  }

}
