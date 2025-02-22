import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class NewPlatformRequest {
  @IsOptional()
  @IsNumber()
  igdbPlatformId?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  abbreviation?: string;

  @IsOptional()
  @IsNumber()
  generation?: number;
}