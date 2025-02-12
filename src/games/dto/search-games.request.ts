import { IsOptional, IsString} from 'class-validator';

export class SearchGamesRequest {
    @IsOptional()
    @IsString()
    query?: string;

    @IsOptional()
    @IsString()
    barcode?: string;
}
