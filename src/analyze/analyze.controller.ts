import { Body, Controller, Post } from '@nestjs/common';
import { AnalyzeService } from './analyze.service';
import { ImagesAnalyzeRequestDto as ImagesAnalyzeRequest } from './dto/images-analyze.request';
import { GameAnalyzeResponse } from './dto/game-analyze.response';
import { Game } from '@prisma/client';

@Controller('analyze')
export class AnalyzeController {
    constructor(private readonly analyzeService: AnalyzeService) { }

    @Post('images')
    async analyzeMultipleImages(
        @Body() request: ImagesAnalyzeRequest,
    ): Promise<string> {
        return this.analyzeService.analyzeMultipleImages(request.images, request.prompt);
    }

    @Post('game/analyze')
    async analyzeGame(
        @Body('images') images: string[],
    ): Promise<GameAnalyzeResponse> {
        return this.analyzeService.analyzeGame(images);
    }

    @Post('games')
    async fetchGamesFromImages(
        @Body('images') images: string[],
    ): Promise<Game[]> {
        return this.analyzeService.fetchGamesFromImages(images);
    }

}

