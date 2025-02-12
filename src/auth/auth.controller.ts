import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.request';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GetUser } from '../common/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { Response } from 'express';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Public()
    @Post('register')
    register(
        @Body() registerRequest: RegisterRequest,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.register({ registerRequest, response });
    }

    @Public()
    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    async login(
        @GetUser() user: User,
        @Res({ passthrough: true }) response: Response
    ) {
        await this.authService.login({ user, response });
    }

    @Post('refresh')
    @Public()
    @UseGuards(JwtRefreshAuthGuard)
    @HttpCode(HttpStatus.OK)
    async refresh(
        @GetUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.login({ user, response });
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @GetUser() user: User,
    ): Promise<string> {
        return await this.authService.logout({ user });
    }

    @Public()
    @Get('google/login')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() { }

    @Public()
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleCallback(
        @GetUser() user: User,
        @Res({ passthrough: true }) response: Response
    ) {
        await this.authService.login({ user, response });
    }

}
