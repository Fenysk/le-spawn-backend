import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class GetGamesFromImagesRequest {
  @IsArray()
  @IsUrl({}, { each: true })
  readonly images: string[];

  @IsOptional()
  @IsString()
  readonly barcode?: string;
}
