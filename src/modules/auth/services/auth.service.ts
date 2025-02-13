import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@api/database/prisma.service';
import { UserService } from '@api/modules/users/services/user.service';
import { SerializerUtil } from '@api/core/common/serializer.util';
import { LoginResponseSerializer } from '../serializers/login-response.serializer';
import { Status } from '@api/enums/status.enum';
import { Messages } from '@api/constants/messages';
import { SocialProvider, User } from '@prisma/client';
import { SocialAuthService } from './social-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly socialAuthService: SocialAuthService,
  ) {}

  // Unified method to generate a token for any use case
  private async createToken(payload: any, expiresIn?: string): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: expiresIn || this.configService.get<string>('JWT_EXPIRES_IN') || '3600s',  // Default to 1 hour if not provided
    });
  }

  // validate user
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
      // Check if user exists
      if (!user) {
        throw new UnauthorizedException(Messages.Auth.Error.INVALID_CREDENTIALS);
      }
      // Check if user is active
      if (user.status !== Status.ACTIVE) {
        throw new UnauthorizedException(Messages.Auth.Error.USER_ACCOUNT_IS_NOT_ACTIVE);
      }
      // Check if password is correct
      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException(Messages.Auth.Error.PASSWORDS_DO_NOT_MATCH);
      }
    return user;
  }

  // Login method
  async login(email: string, password: string): Promise<any> {
    const user = await this.validateUser(email, password);
    const payload = { email: user.email, sub: user.id };
    const accessToken = await this.createToken(payload);
    const refreshToken = await this.createToken(payload, this.configService.get<string>('JWT_REFRESH_DURATION'));
    await this.saveRefreshToken(user.id, refreshToken);
    const serializedUser = SerializerUtil.serialize(user, LoginResponseSerializer);
    return {
      ...serializedUser,
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }

  //save refresh token
  async saveRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = this.hashRefreshToken(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  private hashRefreshToken(refreshToken: string): string {
    // Implement a hashing function (e.g., using bcrypt)
    return refreshToken;
  }

  // get new access token behalf of the refresh token 
  async refreshTokens(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const userId = decoded.sub;

      // Validate the refresh token from the database
      const storedToken = await this.getStoredRefreshToken(userId);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedException(Messages.Auth.Error.TOKEN_INVALID);
      }
      // Create a new access token
      const payload = { email: decoded.email, sub: decoded.sub };
      const newAccessToken = await this.createToken(payload);
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException(Messages.Auth.Error.REFRESH_TOKEN_INVALID);
    }
  }

  async getStoredRefreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { refreshToken: true }
    });
    return user?.refreshToken || null;
  }

  // Example of token generation for other use cases (e.g., password reset, email verification)
  async generateCustomToken(userId: string, expiresIn: string): Promise<string> {
    const payload = { sub: userId };
    return this.createToken(payload, expiresIn);  // Use custom expiration time
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(Messages.Auth.Error.USER_NOT_FOUND);
    }
    // Generate a reset token (JWT)
    const resetToken = this.jwtService.sign(
      { email: user.email, sub: user.id },
      { expiresIn: '15m' } // Token expires in 15 minutes
    );

    // const resetLink = `https://yourapp.com/reset-password?token=${resetToken}`;
    // Example: await this.emailService.sendResetEmail(user.email, resetToken);
    // console.log(`Send email to ${email} with reset link: ${resetLink}`);
    return { message: Messages.Auth.Success.EMAIL_SENT_SUCCESS };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify the reset token
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new UnauthorizedException(Messages.Auth.Error.TOKEN_INVALID);
      }
      // Hash the new password 
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Update the user's password
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      return { message: Messages.Auth.Success.PASSWORD_RESET_SUCCESS};
    } catch (error) {
      throw new UnauthorizedException(Messages.Auth.Error.TOKEN_INVALID);
    }
  }

  // google login
  async googleLogin(token: string) {
    return this.socialLogin(SocialProvider.GOOGLE, token);
  }

  async facebookLogin(token: string) {
    return this.socialLogin(SocialProvider.FACEBOOK, token);
  }

  private async socialLogin(provider: SocialProvider, token: string) {
    try {
      const socialData = await this.socialAuthService.validateSocialLogin(provider, token);
      
      const user = await this.userService.findOrCreateSocialUser({
        email: socialData.email,
        firstName: socialData.firstName,
        lastName: socialData.lastName,
        profilePic: socialData.profilePic,
        provider,
        socialId: socialData.id,
      });

      return this.generateAuthTokens(user);
    } catch (error) {
      const errorMessage = `Failed to authenticate with ${provider}: ${error.message}`;
      throw new UnauthorizedException(errorMessage);
    }
  }

  private async generateAuthTokens(user: User) {
    const payload = { email: user.email, sub: user.id };
    const [accessToken, refreshToken] = await Promise.all([
      this.createToken(payload),
      this.createToken(payload, this.configService.get<string>('JWT_REFRESH_DURATION')),
    ]);

    await this.saveRefreshToken(user.id, refreshToken);
    
    return {
      ...SerializerUtil.serialize(user, LoginResponseSerializer),
      accessToken,
      refreshToken,
    };
  }
}
