import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UpdateCollectionRequest {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @IsNotEmpty()
    @IsString()
    title: string;
}