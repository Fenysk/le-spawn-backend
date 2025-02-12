import { Module } from '@nestjs/common';
import { ScandexModule } from 'src/scandex/scandex.module';
import { IgdbModule } from 'src/igdb/igdb.module';
import { GamesBankService } from 'src/bank/games/games-bank.service';
import { PlatformsBankService } from 'src/bank/platforms/platforms-bank.service';
import { PlatformsController } from './platforms/platforms.controller';
import { BankService } from './bank.service';
import { GamesController } from './games/games.controller';

@Module({
  imports: [
    ScandexModule,
    IgdbModule,
  ],
  controllers: [
    PlatformsController,
    GamesController,
  ],
  providers: [
    BankService,
    GamesBankService,
    PlatformsBankService,
  ],
})
export class BankModule { }
