import { Controller, Post, Body, Put, Delete, Param } from '@nestjs/common';
import { GamesCollectionService } from '@/collections/games/games-collection.service';
import { AddGameItemToCollectionRequest } from '@/collections/dto/add-game-item-to-collection.request';
import { GameCollectionItem, User } from '@prisma/client';
import { UpdateGameItemInCollectionRequest } from '@/collections/dto/update-game-item-in-collection.request';
import { GetUser } from '@/common/decorator/get-user.decorator';

@Controller('collections/games')
export class GamesCollectionController {
    constructor(private readonly gamesCollectionService: GamesCollectionService) { }

    @Post()
    addGameToCollection(
        @GetUser() user: User,
        @Body() gameItemData: AddGameItemToCollectionRequest
    ): Promise<GameCollectionItem> {
        return this.gamesCollectionService.addGameToCollection(user.id, gameItemData);
    }

    @Put()
    updateGameItemInCollection(
        @GetUser() user: User,
        @Body() updateGameItemData: UpdateGameItemInCollectionRequest
    ): Promise<GameCollectionItem> {
        return this.gamesCollectionService.updateGameItemInCollection(user.id, updateGameItemData);
    }

    @Delete(':id')
    deleteGameItemFromCollection(
        @GetUser() user: User,
        @Param('id') gameItemId: string
    ): Promise<string> {
        return this.gamesCollectionService.deleteGameItemFromCollection(user.id, gameItemId);
    }

}
