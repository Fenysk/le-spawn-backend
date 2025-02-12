import { Module } from '@nestjs/common';
import { ScandexService } from './scandex.service';
import { ScandexController } from './scandex.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CommonModule
  ],
  controllers: [
    ScandexController
  ],
  providers: [
    ScandexService,
  ],
  exports: [
    ScandexService,
  ],
})
export class ScandexModule { }
