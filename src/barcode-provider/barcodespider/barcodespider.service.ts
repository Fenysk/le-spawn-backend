import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BarcodespiderApiResponse } from './interfaces/barcodespider-api.response';
import { ApiService } from '../../common/api.service';

@Injectable()
export class BarcodespiderService {
    private readonly baseUrl: string;
    private readonly apiToken: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly apiService: ApiService
    ) {
        this.baseUrl = this.configService.get<string>('BARCODESPIDER_API_URL');
        this.apiToken = this.configService.get<string>('BARCODESPIDER_API_TOKEN');
    }

    async lookup({
        barcode
    }: {
        barcode: string
    }): Promise<BarcodespiderApiResponse> {
        if (!barcode || !/^\d+$/.test(barcode)) {
            throw new BadRequestException('Invalid barcode format. Barcode must contain only digits.');
        }

        try {
            const response = await this.apiService.requestToApi<BarcodespiderApiResponse>({
                baseUrl: this.baseUrl,
                endpoint: '/lookup',
                params: {
                    token: this.apiToken,
                    upc: barcode
                }
            });

            if (!response.item_response) {
                throw new ServiceUnavailableException('Invalid response from Barcodespider API');
            }

            switch (response.item_response.code) {
                case 200:
                    if (!response.item_attributes) {
                        throw new NotFoundException('Item not found');
                    }
                    return response;
                case 401:
                    throw new UnauthorizedException('Invalid API token');
                case 429:
                    throw new ServiceUnavailableException('Rate limit exceeded. Please try again later.');
                case 400:
                    throw new BadRequestException(response.item_response.message || 'Invalid request');
                case 404:
                    throw new NotFoundException(response.item_response.message || 'Item not found');
                default:
                    throw new ServiceUnavailableException(
                        response.item_response.message || 'An error occurred while fetching barcode data'
                    );
            }
        } catch (error) {
            if (error instanceof BadRequestException
                || error instanceof NotFoundException
                || error instanceof UnauthorizedException
                || error instanceof ServiceUnavailableException) {
                throw error;
            }

            throw new ServiceUnavailableException(
                'Unable to connect to Barcodespider API. Please try again later.'
            );
        }
    }
}
