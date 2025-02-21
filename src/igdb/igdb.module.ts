import { Module } from '@nestjs/common';
import { IgdbService } from './igdb.service';
import { TwitchModule } from '@/twitch/twitch.module';
import { IgdbController } from './igdb.controller';

@Module({
  imports: [
    TwitchModule,
  ],
  providers: [
    IgdbService
  ],
  exports: [
    IgdbService
  ],
  controllers: [IgdbController],
})
export class IgdbModule { }
