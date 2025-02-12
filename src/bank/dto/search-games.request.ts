import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SearchGamesRequest {
    @IsOptional()
    @IsString()
    query?: string;

    @IsOptional()
    @IsString()
    barcode?: string;

    @IsOptional()
    @IsUUID()
    id?: string;
}
