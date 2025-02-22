import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class DeleteFileUrlRequest {
    @IsUrl()
    @IsNotEmpty()
    url: string;

    @IsOptional()
    @IsString()
    bucket?: string;
}
