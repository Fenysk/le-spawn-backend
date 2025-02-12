import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { ScandexModule } from 'src/scandex/scandex.module';
import { IgdbModule } from 'src/igdb/igdb.module';
import { GamesBankService } from './services/games-bank.service';
import { PlatformsBankService } from './services/platforms-bank.service';
import { PlatformsController } from './controllers/platforms.controller';

@Module({
  imports: [
    ScandexModule,
    IgdbModule
  ],
  providers: [
    GamesService,
    GamesBankService,
    PlatformsBankService
  ],
  controllers: [GamesController, PlatformsController]
})
export class GamesModule { }
