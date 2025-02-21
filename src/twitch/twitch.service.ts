import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpMethodEnum } from '@/common/enums/http-method.enum';
import { ApiService } from '@/common/services/api.service';
import { TwitchAuthResponse } from './interface/twitch-auth.response';

@Injectable()
export class TwitchService {
    public oauthUrl: string;
    public accessToken: string | null = null;

    constructor(
        private readonly configService: ConfigService,
        private readonly apiService: ApiService
    ) {
        const oauthUrl = this.configService.get<string>('TWITCH_OAUTH_URL');

        if (!oauthUrl)
            throw new InternalServerErrorException('TWITCH_OAUTH_URL is not defined');

        this.oauthUrl = oauthUrl;
    }

    public async getAccessToken(): Promise<TwitchAuthResponse> {
        const clientId = this.configService.get<string>('TWITCH_CLIENT_ID');
        const clientSecret = this.configService.get<string>('TWITCH_CLIENT_SECRET');

        if (!clientId || !clientSecret)
            throw new InternalServerErrorException('Twitch credentials are not properly configured');

        try {
            const response = await this.apiService.requestToApi<TwitchAuthResponse>({
                baseUrl: this.oauthUrl,
                method: HttpMethodEnum.POST,
                params: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'client_credentials'
                }
            });

            if (!response)
                throw new InternalServerErrorException('Invalid response from Twitch API');

            return response;
        } catch (error) {
            if (error instanceof InternalServerErrorException)
                throw error;

            throw new Error(error.message);
        }
    }
}
