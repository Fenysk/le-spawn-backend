import { IsNotEmpty, IsString } from "class-validator";

export class UpdateCollectionRequest {
    @IsNotEmpty()
    @IsString()
    title: string;
}