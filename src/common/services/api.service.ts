import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpMethodEnum } from '../enums/http-method.enum';

@Injectable()
export class ApiService {
    async requestToApi<T>({
        baseUrl,
        endpoint,
        headers = {},
        params = {},
        body,
        method = HttpMethodEnum.GET
    }: {
        baseUrl: string;
        endpoint?: string;
        headers?: Record<string, any>;
        params?: Record<string, any>;
        body?: string;
        method?: HttpMethodEnum;
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

        if (body)
            options.body = JSON.stringify(body);

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

export { HttpMethodEnum };
