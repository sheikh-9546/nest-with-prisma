import { Injectable, BadRequestException } from '@nestjs/common';
import { SocialProvider } from '@prisma/client';
import { ISocialAuthProvider } from '../interfaces/social-provider.interface';
import { FacebookAuthProvider } from '../providers/facebook-auth.provider';
import { GoogleAuthProvider } from '../providers/google-auth.provider';

@Injectable()
export class SocialAuthService {
  private providers: Map<SocialProvider, ISocialAuthProvider>;

  constructor(
    private readonly facebookAuthProvider: FacebookAuthProvider,
    private readonly googleAuthProvider: GoogleAuthProvider,
  ) {
    this.providers = new Map<SocialProvider, ISocialAuthProvider>([
      [SocialProvider.FACEBOOK, facebookAuthProvider],
      [SocialProvider.GOOGLE, googleAuthProvider],
    ]);
  }

  async validateSocialLogin(provider: SocialProvider, token: string) {
    const authProvider = this.providers.get(provider);
    if (!authProvider) {
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    return authProvider.verify(token);
  }
} 