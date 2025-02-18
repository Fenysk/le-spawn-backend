import { HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiService } from '../../common/api.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpcitemdbApiResponse } from './interface/upcitemdb-api.response';
import { Logger } from '@nestjs/common';

@Injectable()
export class UpcitemdbService {
    private readonly logger = new Logger(UpcitemdbService.name);

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

            switch (response.code) {
                case 'INVALID_UPC':
                    throw new BadRequestException(response.message);
                case 'INVALID_QUERY':
                    throw new BadRequestException(response.message);
                case 'NOT_FOUND':
                    throw new NotFoundException(response.message);
                case 'EXCEED_LIMIT':
                    throw new HttpException(response.message, HttpStatus.TOO_MANY_REQUESTS);
                case 'SERVER_ERR':
                    throw new ServiceUnavailableException(response.message);
                default:
                    if (response.error)
                        throw new ServiceUnavailableException(response.message);

            }

            if (!response.items || response.items.length === 0)
                throw new NotFoundException('Item not found');

            return response;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof HttpException)
                throw error;

            throw new BadRequestException('Failed to process the request');
        }
    }
}
