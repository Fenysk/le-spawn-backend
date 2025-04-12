import { Module } from '@nestjs/common';
import { IgdbModule } from '@/providers/igdb/igdb.module';
import { GamesBankService } from '@/bank/games/games-bank.service';
import { PlatformsBankService } from '@/bank/platforms/platforms-bank.service';
import { PlatformsController } from '@/bank/platforms/platforms.controller';
import { BankService } from '@/bank/bank.service';
import { GamesController } from '@/bank/games/games.controller';
import { BarcodeProviderModule } from '@/providers/barcode/barcode-provider.module';
import { AnalyzeModule } from '@/analyze/analyze.module';
import { RegionModule } from '@/bank/region/region.module';

@Module({
  imports: [
    BarcodeProviderModule,
    IgdbModule,
    AnalyzeModule,
    RegionModule,
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
    BankService,
    GamesBankService,
    PlatformsBankService,
  ]
})
export class BankModule { }
