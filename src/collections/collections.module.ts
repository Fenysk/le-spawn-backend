import { Module } from '@nestjs/common';
import { GamesCollectionService } from '@/collections/games/games-collection.service';
import { GamesCollectionController } from '@/collections/games/games-collection.controller';
import { BankModule } from '@/bank/bank.module';
import { CollectionsService } from '@/collections/collections.service';
import { CollectionsController } from '@/collections/collections.controller';

@Module({
  imports: [
    BankModule
  ],
  providers: [GamesCollectionService, CollectionsService],
  controllers: [GamesCollectionController, CollectionsController]
})
export class CollectionsModule {}
