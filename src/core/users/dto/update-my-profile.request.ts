
import { IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

export class UpdateMyProfileRequest {
    @IsOptional()
    @Matches(/^[\w-]+$/, {
        message: 'Le pseudo ne doit contenir que des lettres, chiffres, tirets et underscores'
    })
    @IsString()
    @MaxLength(30)
    pseudo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    displayName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    biography?: string;

    @IsOptional()
    @IsUrl()
    @MaxLength(200)
    link?: string;

    @IsOptional()
    @IsUrl()
    @MaxLength(500)
    avatarUrl?: string;
}

