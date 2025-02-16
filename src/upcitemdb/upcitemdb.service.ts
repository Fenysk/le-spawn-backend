import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiService } from '../common/api.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpcitemdbApiResponse } from './interface/upcitemdb-api.response';


@Injectable()
export class UpcitemdbService {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly apiService: ApiService,
    ) {
        this.baseUrl = this.configService.get<string>('UPCITEMDB_BASE_URL');
        this.apiKey = this.configService.get<string>('UPCITEMDB_API_KEY');
    }

    async lookup({
        barcode
    }: {
        barcode: number
    }): Promise<UpcitemdbApiResponse> {
        try {
            const response = await this.apiService.requestToApi<UpcitemdbApiResponse>({
                baseUrl: this.baseUrl,
                endpoint: '/trial/lookup',
                params: { upc: barcode },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (response.error) {
                if (response.code === 'EXCEED_LIMIT')
                    throw new ServiceUnavailableException('Invalid barcode');

                throw new BadRequestException(response.error);
            }

            if (!response.items || response.items.length === 0) {
                throw new NotFoundException('Item not found');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }
}
