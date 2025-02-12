import { IsOptional, IsString} from 'class-validator';

export class SearchPlatformsRequest {
    @IsOptional()
    @IsString()
    query?: string;
}
