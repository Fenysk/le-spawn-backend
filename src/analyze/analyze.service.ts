import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MistralService } from './mistral/mistral.service';
import { JsonService } from '@/common/services/json.service';
import { PROMPTS } from './constants/prompts.constant';
import { GameAnalyzeResponse } from './dto/game-analyze.response';

@Injectable()
export class AnalyzeService {
  private readonly logger = new Logger(AnalyzeService.name);

  constructor(
    private readonly mistralService: MistralService,
    private readonly jsonService: JsonService,
  ) { }

  async analyzeMultipleImages(images: string[], prompt: string): Promise<string> {
    try {
      const analysis = await this.mistralService.analyzeImages(images, prompt);

      return analysis;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Error analyzing multiple images', error);
      throw new BadRequestException('Error analyzing multiple images');
    }
  }

  async analyzeGame(images: string[]): Promise<GameAnalyzeResponse> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const analysis = await this.mistralService.analyzeImages(images, PROMPTS.GAME);

        const parsedAnalysis = this.jsonService.extractJson(analysis);

        return parsedAnalysis;
      } catch (error) {
        this.logger.error(`Error analyzing images on attempt ${attempt + 1}`, error);
        attempt++;
      }
    }

    throw new BadRequestException('Invalid JSON in analysis after multiple attempts');
  }

}