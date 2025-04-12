import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { Transform } from "class-transformer";

export class RegisterRequest {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.toLowerCase())
    pseudo: string;

    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @IsString()
    @IsStrongPassword()
    @IsNotEmpty()
    password: string;
}
