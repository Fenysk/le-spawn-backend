import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MistralService } from './mistral.service';
import { AnalyzeResponse } from '../dto/analyze-response';
import { JsonService } from '@/common/services/json.service';

@Injectable()
export class AnalyzeService {
  private readonly logger = new Logger(AnalyzeService.name);
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(
    private readonly mistralService: MistralService,
    private readonly jsonService: JsonService
  ) {}

  private validateFile(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!this.allowedMimeTypes.includes(file.mimetype))
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed');
    if (file.size > this.maxFileSize)
      throw new BadRequestException('File too large. Maximum size is 10MB');
  }

  async analyzeImage(file: Express.Multer.File): Promise<AnalyzeResponse> {
    try {
      this.validateFile(file);
      
      const response = await this.mistralService.analyzeImage({
        prompt: 'Describe what you see in this image',
        imageBase64: file.buffer.toString('base64'),
      });

      return {
        analysis: response.content
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Error analyzing image', error);
      throw new BadRequestException('Error analyzing image');
    }
  }
} 