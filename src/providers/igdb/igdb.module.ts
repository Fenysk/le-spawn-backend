import { Module } from '@nestjs/common';
import { IgdbService } from './igdb.service';
import { IgdbController } from './igdb.controller';
import { CommonModule } from '@/common/common.module';
import { TwitchService } from './twitch/twitch.service';

@Module({
  imports: [
    CommonModule,
  ],
  providers: [
    IgdbService,
    TwitchService,
  ],
  exports: [
    IgdbService,
    TwitchService,
  ],
  controllers: [IgdbController],
})
export class IgdbModule { }
