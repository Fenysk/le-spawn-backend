import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class AddGameItemToCollectionRequest {
    @IsNotEmpty()
    @IsUUID()
    collectionId: string;

    @IsNotEmpty()
    @IsUUID()
    gameId: string;

    @IsNotEmpty()
    @IsBoolean()
    hasBox: boolean;

    @IsNotEmpty()
    @IsBoolean()
    hasGame: boolean;

    @IsNotEmpty()
    @IsBoolean()
    hasPaper: boolean;

    @IsOptional()
    @IsString()
    stateBox?: string;

    @IsOptional()
    @IsString()
    stateGame?: string;

    @IsOptional()
    @IsString()
    statePaper?: string;
}