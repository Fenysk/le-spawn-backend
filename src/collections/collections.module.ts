import { Module } from '@nestjs/common';
import { GamesCollectionService } from './games/games-collection.service';
import { GamesCollectionController } from './games/games-collection.controller';
import { BankModule } from 'src/bank/bank.module';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';

@Module({
  imports: [
    BankModule
  ],
  providers: [GamesCollectionService, CollectionsService],
  controllers: [GamesCollectionController, CollectionsController]
})
export class CollectionsModule {}
