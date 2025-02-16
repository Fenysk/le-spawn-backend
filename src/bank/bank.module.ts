import { Module } from '@nestjs/common';
import { IgdbModule } from 'src/igdb/igdb.module';
import { GamesBankService } from 'src/bank/games/games-bank.service';
import { PlatformsBankService } from 'src/bank/platforms/platforms-bank.service';
import { PlatformsController } from './platforms/platforms.controller';
import { BankService } from './bank.service';
import { GamesController } from './games/games.controller';
import { BarcodeProviderModule } from 'src/barcode-provider/barcode-provider.module';

@Module({
  imports: [
    BarcodeProviderModule,
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
  exports: [
    GamesBankService,
    BankService,
  ]
})
export class BankModule { }
