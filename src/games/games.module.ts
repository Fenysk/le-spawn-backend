import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { ScandexModule } from 'src/scandex/scandex.module';
import { IgdbModule } from 'src/igdb/igdb.module';
import { GamesBankService } from './services/games-bank.service';

@Module({
  imports: [
    ScandexModule,
    IgdbModule
  ],
  providers: [
    GamesService,
    GamesBankService
  ],
  controllers: [GamesController]
})
export class GamesModule { }
