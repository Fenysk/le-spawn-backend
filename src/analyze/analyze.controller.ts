import { Body, Controller, Post } from '@nestjs/common';
import { AnalyzeService } from './services/analyze.service';
import { ImagesAnalyzeResponse as ImagesAnalyzeResponse } from './dto/analyze.response';
import { ImagesAnalyzeRequestDto as ImagesAnalyzeRequest } from './dto/analyze.request';

@Controller('analyze')
export class AnalyzeController {
    constructor(private readonly analyzeService: AnalyzeService) { }

    @Post('images')
    async analyzeMultipleImages(
        @Body() request: ImagesAnalyzeRequest,
    ): Promise<ImagesAnalyzeResponse> {
        return this.analyzeService.analyzeMultipleImages(request.images, request.prompt);
    }

    @Post('game')
    async analyzeGame(
        @Body('images') images: string[],
    ): Promise<string> {
        return this.analyzeService.analyzeGame(images);
    }

}

