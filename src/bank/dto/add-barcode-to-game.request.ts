import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddBarcodeToGameRequest {
    @IsNotEmpty()
    @IsUUID()
    gameId: string;

    @IsNotEmpty()
    @IsString()
    barcode: string;
}
