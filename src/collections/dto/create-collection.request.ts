import { IsNotEmpty, IsString} from "class-validator";

export class CreateCollectionRequest {
    @IsNotEmpty()
    @IsString()
    title: string;
}