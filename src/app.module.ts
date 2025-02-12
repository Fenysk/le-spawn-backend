import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IgdbModule } from './igdb/igdb.module';
import { ConfigModule } from '@nestjs/config';
import { ScandexModule } from './scandex/scandex.module';
import { CommonModule } from './common/common.module';
import { GamesModule } from './games/games.module';
import { TwitchModule } from './twitch/twitch.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    IgdbModule,
    ScandexModule,
    CommonModule,
    GamesModule,
    TwitchModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}
