import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ISocialAuthProvider } from '../interfaces/social-provider.interface';

@Injectable()
export class FacebookAuthProvider implements ISocialAuthProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async verify(token: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.configService.get('FACEBOOK_GRAPH_API_URL')}`,
          {
            params: {
              fields: 'id,name,email,picture',
              access_token: token,
            },
          }
        )
      );

      const [firstName, ...lastNameParts] = data.name.split(' ');
      
      return {
        id: data.id,
        email: data.email,
        firstName,
        lastName: lastNameParts.join(' '),
        displayName: data.name,
        profilePic: data.picture?.data?.url,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Facebook token');
    }
  }
} 