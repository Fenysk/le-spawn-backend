    import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

    export class AddGameItemToCollectionRequest {
        @IsNotEmpty()
        @IsString()
        frontGameImageUrl: string;

        @IsOptional()
        @IsString()
        backGameImageUrl?: string;

        @IsOptional()
        @IsString()
        barcode?: string;

        @IsOptional()
        @IsUUID()
        collectionId?: string;
    }