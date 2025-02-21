import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpMethodEnum } from '@/common/enums/http-method.enum';
import { ApiService } from '@/common/services/api.service';
import { TwitchAuthResponse } from './interface/twitch-auth.response';

@Injectable()
export class TwitchService {
    oauthUrl: string;
    accessToken: string | null = null;

    constructor(
        private readonly configService: ConfigService,
        private readonly apiService: ApiService
    ) {
        this.oauthUrl = this.configService.get<string>('TWITCH_OAUTH_URL');
    }

    async getAccessToken(): Promise<TwitchAuthResponse> {
        const clientId = this.configService.get<string>('TWITCH_CLIENT_ID');
        const clientSecret = this.configService.get<string>('TWITCH_CLIENT_SECRET');

        const response = await this.apiService.requestToApi<TwitchAuthResponse>({
            baseUrl: this.oauthUrl,
            method: HttpMethodEnum.POST,
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            }
        });

        return response;
    }
}
