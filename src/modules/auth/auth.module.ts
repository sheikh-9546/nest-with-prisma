import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '@api/database/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { SocialAuthService } from './services/social-auth.service';
import { FacebookAuthProvider } from './providers/facebook-auth.provider';
import { GoogleAuthProvider } from './providers/google-auth.provider';

@Module({
    imports: [
        PrismaModule,
        UserModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),  // Load secret from environment variables
                signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '3600s' },
            }),
        }),
        HttpModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        SocialAuthService,
        FacebookAuthProvider,
        GoogleAuthProvider,
    ],
    exports: [AuthService],
})
export class AuthModule { }
