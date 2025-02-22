import { IsArray, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ImagesAnalyzeRequestDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  readonly images: string[];

  @IsString()
  @IsNotEmpty()
  readonly prompt: string;
}