import { Module } from '@nestjs/common';
import { GamesCollectionService } from './games/games-collection.service';
import { GamesCollectionController } from './games/games-collection.controller';
import { BankModule } from 'src/bank/bank.module';

@Module({
  imports: [
    BankModule
  ],
  providers: [GamesCollectionService],
  controllers: [GamesCollectionController]
})
export class CollectionsModule {}
