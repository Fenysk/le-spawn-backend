import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MistralService } from './mistral.service';
import { ImagesAnalyzeResponse } from '../dto/analyze.response';
import { ImagesAnalyzeRequestDto } from '../dto/analyze.request';
import { JsonService } from '@/common/services/json.service';
import { PROMPTS } from '../constants/prompts.constant';

@Injectable()
export class AnalyzeService {
  private readonly logger = new Logger(AnalyzeService.name);

  constructor(
    private readonly mistralService: MistralService,
    private readonly jsonService: JsonService,
  ) { }

  async analyzeMultipleImages(images: string[], prompt: string): Promise<ImagesAnalyzeResponse> {
    try {
      const analysis = await this.mistralService.analyzeImages(images, prompt);

      return {
        analysis,
        images,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Error analyzing multiple images', error);
      throw new BadRequestException('Error analyzing multiple images');
    }
  }

  async analyzeGame(images: string[]): Promise<string> {
    const maxRetries = 3;
    let attempt = 0;
    let parsedAnalysis: string | null = null;

    while (attempt < maxRetries) {
      const analysis = await this.mistralService.analyzeImages(images, PROMPTS.GAME);
      parsedAnalysis = this.jsonService.extractJson(analysis);

      if (this.jsonService.isValidJson(parsedAnalysis as string))
        return parsedAnalysis;

      attempt++;
    }

    throw new BadRequestException('Invalid JSON in analysis after multiple attempts');
  }
}