import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsEnum, IsDate, IsUrl } from 'class-validator';
import { GameCategoryEnumInt } from 'src/igdb/enum/game-category.enum';

export class NewGameRequest {
    @IsOptional()
    @IsNumber()
    igdbGameId?: number;

    @IsArray()
    @IsString({ each: true })
    barcodes?: string[];

    @IsNotEmpty()
    @IsEnum(GameCategoryEnumInt)
    category: GameCategoryEnumInt;

    @IsOptional()
    @IsUrl()
    coverUrl?: string;

    @IsNotEmpty()
    @IsDate()
    firstReleaseDate: Date;

    @IsArray()
    @IsString({ each: true })
    franchises: string[];

    @IsArray()
    @IsString({ each: true })
    genres: string[];

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsArray()
    @IsUrl({}, { each: true })
    screenshotsUrl: string[];

    @IsNotEmpty()
    @IsString()
    storyline: string;

    @IsNotEmpty()
    @IsString()
    summary: string;

    @IsOptional()
    @IsString()
    platformId?: string;
}