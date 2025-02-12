import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum MethodEnum {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

@Injectable()
export class ApiService {

    constructor(
        private readonly configService: ConfigService,
    ) { }

    async requestToApi<T>({
        baseUrl,
        endpoint,
        headers = {},
        params = {},
        method = MethodEnum.GET
    }: {
        baseUrl: string;
        endpoint?: string;
        headers?: Record<string, any>;
        params?: Record<string, any>;
        method?: MethodEnum;
    }): Promise<T> {
        const url = new URL(endpoint ? `${baseUrl}${endpoint}` : baseUrl);

        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        try {
            const response = await fetch(url.toString(), options);

            const data = await response.json();
            return data;
        } catch (error) {
            throw new HttpException(
                'Failed to process the request',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

}
