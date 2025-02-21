import { BadRequestException, HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiService, HttpMethodEnum } from '@/common/services/api.service';
import { PricechartingApiResponse } from '@/barcode-provider/pricecharting/interface/pricecharting-api.response';
import axios from 'axios';

@Injectable()
export class PricechartingService {
    private readonly logger = new Logger(PricechartingService.name);

    private readonly baseUrl: string;
    private apiKey: string;
    private tokenExpiration: Date;

    constructor(
        private readonly configService: ConfigService,
        private readonly apiService: ApiService,
    ) {
        this.baseUrl = this.configService.get<string>('PRICECHARTING_BASE_URL');
        this.apiKey = this.configService.get<string>('PRICECHARTING_API_KEY');
    }

    private async initializeApiKey(): Promise<void> {
        await this.fetchApiKey();
        this.setTokenExpiration();
    }

    private async fetchApiKey(): Promise<void> {
        try {
            const response = await axios.get('https://www.pricecharting.com/api-documentation');
            const content = response.data;

            const codeMatch = content.match(/<code>([^<]+)<\/code>/);
            if (codeMatch && codeMatch[1]) {
                this.apiKey = codeMatch[1].trim();
                console.log('Token successfully extracted from documentation :', this.apiKey);
            } else {
                throw new Error('Token not found in documentation');
            }
        } catch (error) {
            console.error('Failed to extract token from documentation:', error);
            this.apiKey = this.configService.get<string>('PRICECHARTING_API_KEY');
        }
    }

    private setTokenExpiration(): void {
        this.tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    private async checkTokenValidity(): Promise<void> {
        if (new Date() >= this.tokenExpiration) {
            await this.fetchApiKey();
            this.setTokenExpiration();
        }
    }

    async lookup({
        barcode
    }: {
        barcode: string
    }): Promise<PricechartingApiResponse> {
        await this.checkTokenValidity();

        try {
            const response = await this.apiService.requestToApi<PricechartingApiResponse>({
                baseUrl: this.baseUrl,
                endpoint: '/product',
                params: { t: this.apiKey, upc: barcode },
                method: HttpMethodEnum.GET
            });

            if (!response || response.error) {
                const errorMessage = response?.["error-message"] || 'Invalid request or no data returned';
                throw new BadRequestException(errorMessage);
            }

            if (!response.id || !response['product-name']) {
                const errorMessage = response?.["error-message"] || 'Invalid request or no data returned';
                throw new NotFoundException(errorMessage);
            }

            return response;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof HttpException)
                throw error;

            throw new BadRequestException('Failed to process the request');
        }
    }
}
