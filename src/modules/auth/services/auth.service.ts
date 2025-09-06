import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@api/database/prisma.service';
import { UserService } from '@api/modules/users/services/user.service';
import { SerializerUtil } from '@api/core/common/serializer.util';
import { LoginResponseSerializer } from '../serializers/login-response.serializer';
import { Status } from '@api/enums/status.enum';
import { SecurityConstants } from '@api/enums/security.enum';
import { Messages } from '@api/constants/messages';
import { SocialProvider, User } from '@prisma/client';
import { SocialAuthService } from './social-auth.service';
import { HandleAuthErrors } from '@api/core/decorators/handle-errors.decorator';

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
      expiresIn: expiresIn || this.configService.get<string>('JWT_EXPIRES_IN') || SecurityConstants.DEFAULT_JWT_EXPIRES_IN,
    });
  }

  // validate user
  @HandleAuthErrors(Messages.Auth.Error.INVALID_CREDENTIALS)
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
  @HandleAuthErrors(Messages.Auth.Error.INVALID_CREDENTIALS)
  async login(email: string, password: string): Promise<any> {
    const user = await this.validateUser(email, password);
    const payload = { 
      email: user.email, 
      sub: user.id,
      jti: this.generateTokenId() // Add unique token identifier
    };
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
  async saveRefreshToken(userId: number, refreshToken: string) {
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
  @HandleAuthErrors(Messages.Auth.Error.REFRESH_TOKEN_INVALID)
  async refreshTokens(refreshToken: string, oldAccessToken?: string) {
    const decoded = this.jwtService.verify(refreshToken);
    const userId = decoded.sub;

    // Validate the refresh token from the database
    const storedToken = await this.getStoredRefreshToken(userId);
    if (storedToken !== refreshToken) {
      throw new UnauthorizedException(Messages.Auth.Error.TOKEN_INVALID);
    }

    // SECURITY: Always blacklist old access token if provided
    if (oldAccessToken) {
      await this.blacklistToken(oldAccessToken);
    }

    // OPTIONAL: Blacklist ALL existing tokens for this user (most secure)
    // Uncomment the line below for maximum security:
    // await this.blacklistAllUserTokens(userId);

    // Create a new access token with a unique identifier (jti)
    const payload = { 
      email: decoded.email, 
      sub: decoded.sub,
      jti: this.generateTokenId() // Unique token identifier
    };
    const newAccessToken = await this.createToken(payload);
    
    return { 
      accessToken: newAccessToken,
      message: oldAccessToken ? 'Token refreshed. Previous token revoked.' : 'Token refreshed.'
    };
  }

  async getStoredRefreshToken(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { refreshToken: true }
    });
    return user?.refreshToken || null;
  }

  // Generate unique token identifier
  private generateTokenId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Blacklist a token (store in Redis or database)
  async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(token) as any;
      if (decoded && decoded.exp) {
        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        
        // Only blacklist if token hasn't expired yet
        if (expirationTime > currentTime) {
          const ttl = Math.floor((expirationTime - currentTime) / 1000); // TTL in seconds
          
          // Store in database (you could also use Redis for better performance)
          await this.prisma.$executeRaw`
            INSERT INTO blacklisted_tokens (token_id, expires_at) 
            VALUES (${decoded.jti || token}, ${new Date(expirationTime)})
            ON CONFLICT (token_id) DO NOTHING
          `;
        }
      }
    } catch (error) {
      // Log error but don't throw - blacklisting failure shouldn't break the flow
      console.error('Failed to blacklist token:', error);
    }
  }

  // Check if a token is blacklisted
  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 1 FROM blacklisted_tokens 
        WHERE token_id = ${tokenId} AND expires_at > NOW()
        LIMIT 1
      `;
      return Array.isArray(result) && result.length > 0;
    } catch (error) {
      console.error('Failed to check token blacklist:', error);
      return false; // Fail open - don't block valid tokens due to DB issues
    }
  }

  // Blacklist all tokens for a specific user (nuclear option)
  async blacklistAllUserTokens(userId: number): Promise<void> {
    try {
      // This is a more aggressive approach - blacklist tokens by user pattern
      // Note: This requires storing user info in JWT or tracking tokens per user
      const userTokenPattern = `%"sub":${userId}%`;
      
      await this.prisma.$executeRaw`
        INSERT INTO blacklisted_tokens (token_id, expires_at)
        SELECT CONCAT('user-', ${userId}, '-', EXTRACT(EPOCH FROM NOW())), 
               NOW() + INTERVAL '24 hours'
        ON CONFLICT (token_id) DO NOTHING
      `;
      
      console.log(`Blacklisted all tokens for user ${userId}`);
    } catch (error) {
      console.error('Failed to blacklist all user tokens:', error);
    }
  }

  // Logout method - blacklists the current access token
  async logout(accessToken: string): Promise<{ message: string }> {
    await this.blacklistToken(accessToken);
    return { message: 'Successfully logged out' };
  }

  // Logout by user ID and token ID (when using JWT Guard)
  async logoutByUserId(userId: number, tokenId: string): Promise<{ message: string }> {
    if (tokenId) {
      // Blacklist the specific token by its JTI
      await this.blacklistTokenById(tokenId);
    }
    return { message: 'Successfully logged out' };
  }

  // Blacklist a token by its JTI (JWT ID)
  async blacklistTokenById(tokenId: string): Promise<void> {
    try {
      // Set expiration to 24 hours from now (or use JWT expiration if available)
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await this.prisma.$executeRaw`
        INSERT INTO blacklisted_tokens (token_id, expires_at) 
        VALUES (${tokenId}, ${expirationTime})
        ON CONFLICT (token_id) DO NOTHING
      `;
      
      console.log(`Token ${tokenId} blacklisted successfully`);
    } catch (error) {
      console.error('Failed to blacklist token by ID:', error);
    }
  }

  // Logout from all devices - blacklists all tokens for a user
  async logoutFromAllDevices(userId: number): Promise<{ message: string }> {
    // Clear refresh token from database
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
    
    // Note: We can't easily blacklist all access tokens without storing them
    // This is a limitation of JWT - consider using shorter expiration times
    return { message: 'Successfully logged out from all devices' };
  }

  // Example of token generation for other use cases (e.g., password reset, email verification)
  async generateCustomToken(userId: number, expiresIn: string): Promise<string> {
    const payload = { sub: userId };
    return this.createToken(payload, expiresIn);  // Use custom expiration time
  }

  @HandleAuthErrors(Messages.Auth.Error.USER_NOT_FOUND)
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

  @HandleAuthErrors(Messages.Auth.Error.TOKEN_INVALID)
  async resetPassword(token: string, newPassword: string) {
    // Verify the reset token
    const decoded = this.jwtService.verify(token);
    const userId = decoded.sub;
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new UnauthorizedException(Messages.Auth.Error.USER_NOT_FOUND);
    }
    
    // Hash the new password 
    const hashedPassword = await bcrypt.hash(newPassword, SecurityConstants.BCRYPT_SALT_ROUNDS);
    
    // Update the user's password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    return { message: Messages.Auth.Success.PASSWORD_RESET_SUCCESS };
  }

  // google login
  @HandleAuthErrors(Messages.Auth.Error.INVALID_CREDENTIALS)
  async googleLogin(token: string) {
    return this.socialLogin(SocialProvider.GOOGLE, token);
  }

  @HandleAuthErrors(Messages.Auth.Error.INVALID_CREDENTIALS)
  async facebookLogin(token: string) {
    return this.socialLogin(SocialProvider.FACEBOOK, token);
  }

  @HandleAuthErrors(Messages.Auth.Error.INVALID_CREDENTIALS)
  private async socialLogin(provider: SocialProvider, token: string) {
    const socialData = await this.socialAuthService.validateSocialLogin(provider, token);
    
    const user = await this.userService.findOrCreateSocialUser({
      email: socialData.email,
      firstName: socialData.firstName,
      lastName: socialData.lastName,
      profilePic: socialData.profilePic,
      displayName: socialData.displayName,
      accessToken: token, // Store the provided token
      provider,
      socialId: socialData.id,
    });

    return this.generateAuthTokens(user);
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
