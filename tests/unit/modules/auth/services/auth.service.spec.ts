import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compareSync: jest.fn(),
  hash: jest.fn(),
}));
import { AuthService } from '@api/modules/auth/services/auth.service';
import { PrismaService } from '@api/database/prisma.service';
import { UserService } from '@api/modules/users/services/user.service';
import { SocialAuthService } from '@api/modules/auth/services/social-auth.service';
import { Status } from '@api/enums/status.enum';
import { Messages } from '@api/constants/messages';
import { SocialProvider } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let socialAuthService: SocialAuthService;

  const mockUser = {
    id: 1,
    userId: 'user-uuid-123',
    email: 'test@example.com',
    password: '$2a$10$hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    status: Status.ACTIVE,
    phoneNumber: '+1234567890',
    profilePicture: null,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockUserService = {
    findOrCreateSocialUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockSocialAuthService = {
    validateSocialLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: SocialAuthService,
          useValue: mockSocialAuthService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    socialAuthService = module.get<SocialAuthService>(SocialAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password'),
      ).rejects.toThrow(new UnauthorizedException(Messages.Auth.Error.INVALID_CREDENTIALS));
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      const inactiveUser = { ...mockUser, status: Status.INACTIVE };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(new UnauthorizedException(Messages.Auth.Error.USER_ACCOUNT_IS_NOT_ACTIVE));
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(new UnauthorizedException(Messages.Auth.Error.PASSWORDS_DO_NOT_MATCH));
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      mockJwtService.sign.mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);
      mockConfigService.get.mockReturnValue('jwt-secret');
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.login(email, password);

      expect(result).toEqual({
        id: expect.any(Number),
        userId: expect.any(String),
        email: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        accessToken,
        refreshToken,
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { refreshToken: expect.any(String) },
      });
    });
  });

  describe('googleLogin', () => {
    it('should handle Google social login', async () => {
      const socialData = {
        id: 'google-id-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'John Doe',
        profilePic: 'https://example.com/pic.jpg',
      };
      const accessToken = 'jwt-access-token';
      const refreshToken = 'jwt-refresh-token';

      mockSocialAuthService.validateSocialLogin.mockResolvedValue(socialData);
      mockUserService.findOrCreateSocialUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);
      mockConfigService.get.mockReturnValue('jwt-secret');
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.googleLogin('google-token');

      expect(result).toEqual({
        id: expect.any(Number),
        userId: expect.any(String),
        email: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        accessToken,
        refreshToken,
      });
      expect(mockSocialAuthService.validateSocialLogin).toHaveBeenCalledWith(
        SocialProvider.GOOGLE,
        'google-token',
      );
      expect(mockUserService.findOrCreateSocialUser).toHaveBeenCalledWith({
        email: socialData.email,
        firstName: socialData.firstName,
        lastName: socialData.lastName,
        profilePic: socialData.profilePic,
        displayName: socialData.displayName,
        accessToken: 'google-token',
        provider: SocialProvider.GOOGLE,
        socialId: socialData.id,
      });
    });
  });

  describe('facebookLogin', () => {
    it('should handle Facebook social login', async () => {
      const socialData = {
        id: 'facebook-id-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'John Doe',
        profilePic: 'https://example.com/pic.jpg',
      };
      const accessToken = 'jwt-access-token';
      const refreshToken = 'jwt-refresh-token';

      mockSocialAuthService.validateSocialLogin.mockResolvedValue(socialData);
      mockUserService.findOrCreateSocialUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);
      mockConfigService.get.mockReturnValue('jwt-secret');
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.facebookLogin('facebook-token');

      expect(result).toEqual({
        id: expect.any(Number),
        userId: expect.any(String),
        email: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        accessToken,
        refreshToken,
      });
      expect(mockSocialAuthService.validateSocialLogin).toHaveBeenCalledWith(
        SocialProvider.FACEBOOK,
        'facebook-token',
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh access token with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const newAccessToken = 'new-access-token';
      const payload = { sub: mockUser.id, email: mockUser.email };

      mockJwtService.verify.mockReturnValue(payload);
      mockPrismaService.user.findUnique.mockResolvedValue({ refreshToken });
      mockJwtService.sign.mockReturnValue(newAccessToken);
      mockConfigService.get.mockReturnValue('jwt-secret');

      const result = await service.refreshTokens(refreshToken);

      expect(result).toEqual({
        accessToken: newAccessToken,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });



  describe('requestPasswordReset', () => {
    it('should generate password reset token', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('reset-token');

      const result = await service.requestPasswordReset(email);

      expect(result).toEqual({
        message: Messages.Auth.Success.EMAIL_SENT_SUCCESS,
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const email = 'nonexistent@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.requestPasswordReset(email)).rejects.toThrow(
        new UnauthorizedException(Messages.Auth.Error.USER_NOT_FOUND),
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'newPassword';
      const payload = { sub: mockUser.id, email: mockUser.email };
      const hashedPassword = '$2a$10$newHashedPassword';

      mockJwtService.verify.mockReturnValue(payload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await service.resetPassword(token, newPassword);

      expect(result).toEqual({ message: Messages.Auth.Success.PASSWORD_RESET_SUCCESS });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: hashedPassword },
      });
    });

    it('should throw UnauthorizedException for invalid reset token', async () => {
      const token = 'invalid-reset-token';
      const newPassword = 'newPassword';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
