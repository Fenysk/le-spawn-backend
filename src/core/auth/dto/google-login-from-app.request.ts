import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class GoogleLoginFromAppRequest {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    displayName: string;

    @IsNotEmpty()
    @IsUrl()
    photoUrl: string;
}