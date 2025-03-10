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

    @Post('game/images')
    async analyzeGameFromImages(
        @Body('images') images: string[],
    ): Promise<GameAnalyzeResponse> {
        return this.analyzeService.analyzeGameFromImages(images);
    }

    @Post('game/compare')
    async compareGamesList(
        @Body('gameAnalyze') gameAnalyze: GameAnalyzeResponse,
        @Body('appGames') appGames: Game[],
    ): Promise<Game> {
        return this.analyzeService.compareGamesListFromAnalyzeResponse(gameAnalyze, appGames);
    }

}

