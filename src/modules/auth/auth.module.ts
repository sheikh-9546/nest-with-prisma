import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '@api/database/prisma.module';

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
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }
