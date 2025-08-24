import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SocialAuthService } from '@api/modules/auth/services/social-auth.service';
import { FacebookAuthProvider } from '@api/modules/auth/providers/facebook-auth.provider';
import { GoogleAuthProvider } from '@api/modules/auth/providers/google-auth.provider';
import { SocialProvider } from '@prisma/client';

describe('SocialAuthService', () => {
  let service: SocialAuthService;
  let facebookAuthProvider: FacebookAuthProvider;
  let googleAuthProvider: GoogleAuthProvider;

  const mockSocialData = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    accessToken: 'provider-access-token',
  };

  const mockFacebookAuthProvider = {
    verify: jest.fn(),
  };

  const mockGoogleAuthProvider = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialAuthService,
        {
          provide: FacebookAuthProvider,
          useValue: mockFacebookAuthProvider,
        },
        {
          provide: GoogleAuthProvider,
          useValue: mockGoogleAuthProvider,
        },
      ],
    }).compile();

    service = module.get<SocialAuthService>(SocialAuthService);
    facebookAuthProvider = module.get<FacebookAuthProvider>(FacebookAuthProvider);
    googleAuthProvider = module.get<GoogleAuthProvider>(GoogleAuthProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateSocialLogin', () => {
    it('should validate Google login successfully', async () => {
      const token = 'google-oauth-token';
      mockGoogleAuthProvider.verify.mockResolvedValue(mockSocialData);

      const result = await service.validateSocialLogin(SocialProvider.GOOGLE, token);

      expect(result).toEqual(mockSocialData);
      expect(mockGoogleAuthProvider.verify).toHaveBeenCalledWith(token);
    });

    it('should validate Facebook login successfully', async () => {
      const token = 'facebook-access-token';
      mockFacebookAuthProvider.verify.mockResolvedValue(mockSocialData);

      const result = await service.validateSocialLogin(SocialProvider.FACEBOOK, token);

      expect(result).toEqual(mockSocialData);
      expect(mockFacebookAuthProvider.verify).toHaveBeenCalledWith(token);
    });

    it('should throw BadRequestException for unsupported provider', async () => {
      const token = 'some-token';
      const unsupportedProvider = 'TWITTER' as SocialProvider;

      await expect(
        service.validateSocialLogin(unsupportedProvider, token),
      ).rejects.toThrow(
        new BadRequestException(`Unsupported provider: ${unsupportedProvider}`),
      );
    });

    it('should handle provider verification errors', async () => {
      const token = 'invalid-google-token';
      const error = new Error('Invalid token');
      mockGoogleAuthProvider.verify.mockRejectedValue(error);

      await expect(
        service.validateSocialLogin(SocialProvider.GOOGLE, token),
      ).rejects.toThrow(error);
      expect(mockGoogleAuthProvider.verify).toHaveBeenCalledWith(token);
    });
  });
});
