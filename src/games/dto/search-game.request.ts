import { IsOptional, IsString} from 'class-validator';

export class SearchGameDto {
    @IsOptional()
    @IsString()
    query?: string;

    @IsOptional()
    @IsString()
    barcode?: string;
}
