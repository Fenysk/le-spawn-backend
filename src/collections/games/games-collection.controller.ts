import { Controller, Post, Body, Get } from '@nestjs/common';
import { GamesCollectionService } from './games-collection.service';
import { AddGameItemToCollectionRequest } from '../dto/add-game-item-to-collection.request';
import { GameCollectionItem } from '@prisma/client';

@Controller('collections/games')
export class GamesCollectionController {
    constructor(private readonly gamesCollectionService: GamesCollectionService) { }

    @Get()
    getGamesCollection(): Promise<GameCollectionItem[]> {
        return this.gamesCollectionService.getGamesCollection();
    }

    @Post()
    addGameToCollection(
        @Body() gameItemData: AddGameItemToCollectionRequest
    ): Promise<GameCollectionItem> {
        return this.gamesCollectionService.addGameToCollection(gameItemData);
    }
}
