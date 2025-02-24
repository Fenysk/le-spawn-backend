import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsEnum, IsDate, IsUrl, ValidateNested, IsUUID } from 'class-validator';
import { GameCategoryEnumInt } from '@/igdb/enum/game-category.enum';
import { Type } from 'class-transformer';

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
    @IsOptional()
    @IsString({ each: true })
    franchises?: string[];

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
    @IsArray()
    @IsString({ each: true })
    platformIds?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NewGameLocalizationRequest)
    gameLocalizations?: NewGameLocalizationRequest[];
}

export class NewGameLocalizationRequest {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsUrl()
    coverUrl?: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    regionId: string;
}