import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';
import { MistralService } from './mistral/mistral.service';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
  ],
  controllers: [
    AnalyzeController,
  ],
  providers: [
    AnalyzeService,
    MistralService,
  ],
  exports: [
    AnalyzeService,
  ],
})
export class AnalyzeModule { } 