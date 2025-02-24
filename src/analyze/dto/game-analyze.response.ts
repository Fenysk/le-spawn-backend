import { IsOptional, IsString } from 'class-validator';

export class GameAnalyzeResponse {
  @IsOptional()
  @IsString()
  readonly title: string | null;

  @IsOptional()
  @IsString()
  readonly platform: string | null;

  @IsOptional()
  @IsString()
  readonly simpleTitle: string | null;
}