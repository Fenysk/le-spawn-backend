import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScandexLookupResponse } from './interface/lookup.response';
import { ApiService } from '../../common/api.service';

@Injectable()
export class ScandexService {
    private readonly baseUrl: string;
    private readonly accessToken: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly apiService: ApiService,
    ) {
        this.baseUrl = this.configService.get<string>('SCANDEX_BASE_URL');
        this.accessToken = this.configService.get<string>('SCANDEX_ACCESS_TOKEN');
    }

    async lookup({
        barcode
    }: {
        barcode: string
    }): Promise<ScandexLookupResponse> {
        try {
            const response = await this.apiService.requestToApi<ScandexLookupResponse>({
                baseUrl: this.baseUrl,
                endpoint: '/lookup',
                params: { value: barcode },
                headers: {
                    'Authorization': `${this.accessToken}`
                }
            });

            if ('error' in response) {
                throw new BadRequestException(response.error);
            }

            if ('message' in response && response.message.includes('No results for this barcode')) {
                throw new NotFoundException('Game not found');
            }

            if (response.id && !response.igdb_metadata && !response.name) {
                throw new NotFoundException('Game not found');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }
}
