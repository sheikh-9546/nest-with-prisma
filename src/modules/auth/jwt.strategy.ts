import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { Messages } from '@api/constants/messages';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false, 
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Check if token is blacklisted
    if (payload.jti && await this.authService.isTokenBlacklisted(payload.jti)) {
      throw new UnauthorizedException(Messages.Auth.Error.TOKEN_INVALID);
    }
    
    return { id: payload.sub, email: payload.email, jti: payload.jti };
  }
}
