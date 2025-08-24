import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@api/modules/auth/auth.controller';
import { AuthService } from '@api/modules/auth/services/auth.service';
import { LoginDto } from '@api/interface/dto/login.dto';
import { RefreshTokenDto } from '@api/interface/dto/refresh-token.dto';
import { RequestPasswordResetDto } from '@api/interface/dto/request-password-reset.dto';
import { ResetPasswordDto } from '@api/interface/dto/reset-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    googleLogin: jest.fn(),
    facebookLogin: jest.fn(),
    refreshTokens: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockLoginResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: {
      id: 1,
      userId: 'user-uuid-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should handle login errors', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });

  describe('googleLogin', () => {
    it('should login user with Google token', async () => {
      const token = 'google-oauth-token';
      const tokenDto = { token };

      mockAuthService.googleLogin.mockResolvedValue(mockLoginResponse);

      const result = await controller.googleLogin(tokenDto);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(token);
    });

    it('should handle Google login errors', async () => {
      const token = 'invalid-google-token';
      const tokenDto = { token };

      const error = new Error('Invalid Google token');
      mockAuthService.googleLogin.mockRejectedValue(error);

      await expect(controller.googleLogin(tokenDto)).rejects.toThrow(error);
      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(token);
    });
  });

  describe('facebookLogin', () => {
    it('should login user with Facebook access token', async () => {
      const accessToken = 'facebook-access-token';
      const tokenDto = { accessToken };

      mockAuthService.facebookLogin.mockResolvedValue(mockLoginResponse);

      const result = await controller.facebookLogin(tokenDto);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.facebookLogin).toHaveBeenCalledWith(accessToken);
    });

    it('should handle Facebook login errors', async () => {
      const accessToken = 'invalid-facebook-token';
      const tokenDto = { accessToken };

      const error = new Error('Invalid Facebook token');
      mockAuthService.facebookLogin.mockRejectedValue(error);

      await expect(controller.facebookLogin(tokenDto)).rejects.toThrow(error);
      expect(mockAuthService.facebookLogin).toHaveBeenCalledWith(accessToken);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const refreshResponse = {
        accessToken: 'new-access-token',
        user: mockLoginResponse.user,
      };

      mockAuthService.refreshTokens.mockResolvedValue(refreshResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toEqual(refreshResponse);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });

    it('should handle refresh token errors', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      const error = new Error('Invalid refresh token');
      mockAuthService.refreshTokens.mockRejectedValue(error);

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(error);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset for valid email', async () => {
      const requestPasswordResetDto: RequestPasswordResetDto = {
        email: 'test@example.com',
      };

      const resetResponse = {
        message: 'Password reset email sent successfully',
        resetToken: 'reset-token-123',
      };

      mockAuthService.requestPasswordReset.mockResolvedValue(resetResponse);

      const result = await controller.requestPasswordReset(requestPasswordResetDto);

      expect(result).toEqual(resetResponse);
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(
        requestPasswordResetDto.email,
      );
    });

    it('should handle password reset request errors', async () => {
      const requestPasswordResetDto: RequestPasswordResetDto = {
        email: 'nonexistent@example.com',
      };

      const error = new Error('User not found');
      mockAuthService.requestPasswordReset.mockRejectedValue(error);

      await expect(
        controller.requestPasswordReset(requestPasswordResetDto),
      ).rejects.toThrow(error);
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(
        requestPasswordResetDto.email,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'valid-reset-token',
        newPassword: 'newPassword123',
      };

      const resetResponse = {
        message: 'Password reset successfully',
      };

      mockAuthService.resetPassword.mockResolvedValue(resetResponse);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(resetResponse);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    });

    it('should handle password reset errors', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'invalid-reset-token',
        newPassword: 'newPassword123',
      };

      const error = new Error('Invalid reset token');
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        error,
      );
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    });
  });
});
