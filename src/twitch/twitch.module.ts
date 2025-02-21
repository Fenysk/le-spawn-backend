import { Module } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { CommonModule } from '@/common/common.module';
import { TwitchController } from './twitch.controller';

@Module({
  imports: [
    CommonModule,
  ],
  providers: [
    TwitchService,
  ],
  exports: [
    TwitchService,
  ],
  controllers: [TwitchController],
})
export class TwitchModule { }
