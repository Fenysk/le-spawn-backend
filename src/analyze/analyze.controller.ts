import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnalyzeService } from './services/analyze.service';
import { AnalyzeResponse } from './dto/analyze-response';
import { Express } from 'express';

@Controller('analyze')
export class AnalyzeController {
  constructor(private readonly analyzeService: AnalyzeService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AnalyzeResponse> {
    return this.analyzeService.analyzeImage(file);
  }

}