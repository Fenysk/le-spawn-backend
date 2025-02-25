import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddGameItemToCollectionRequest } from '../dto/add-game-item-to-collection.request';
import { GamesBankService } from 'src/bank/games/games-bank.service';
import { GameCollectionItem } from '@prisma/client';
import { UpdateGameItemInCollectionRequest } from '../dto/update-game-item-in-collection.request';

@Injectable()
export class GamesCollectionService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly gamesBankService: GamesBankService,
    ) { }

    async addGameToCollection(
        userId: string,
        gameItemData: AddGameItemToCollectionRequest
    ): Promise<GameCollectionItem> {
        try {
            const collection = await this.prismaService.collection.findUnique({ where: { id: gameItemData.collectionId } });

            if (collection.userId !== userId)
                throw new UnauthorizedException('Unauthorized');

            const isGameAlreadyExist = await this.gamesBankService.searchGames({ id: gameItemData.gameId });

            if (!isGameAlreadyExist)
                console.log('Game not found');

            const newGameCollectionItem = await this.prismaService.gameCollectionItem.create({
                data: {
                    hasBox: gameItemData.hasBox,
                    hasGame: gameItemData.hasGame,
                    hasPaper: gameItemData.hasPaper,
                    stateBox: gameItemData.stateBox,
                    stateGame: gameItemData.stateGame,
                    statePaper: gameItemData.statePaper,
                    collection: { connect: { id: gameItemData.collectionId } },
                    game: { connect: { id: gameItemData.gameId } }
                },
                include: { game: true }
            });

            return newGameCollectionItem;
        } catch (error) {
            throw error;
        }
    }

    async updateGameItemInCollection(
        userId: string,
        updateGameItemData: UpdateGameItemInCollectionRequest
    ): Promise<GameCollectionItem> {
        try {
            const gameCollectionItem = await this.prismaService.gameCollectionItem.findUnique({
                where: { id: updateGameItemData.gameItemId },
                include: { collection: true }
            });

            if (gameCollectionItem.collection.userId !== userId)
                throw new UnauthorizedException('Unauthorized');

            const updatedGameCollectionItem = await this.prismaService.gameCollectionItem.update({
                where: { id: updateGameItemData.gameItemId },
                data: {
                    hasBox: updateGameItemData.hasBox,
                    hasGame: updateGameItemData.hasGame,
                    hasPaper: updateGameItemData.hasPaper,
                    stateBox: updateGameItemData.stateBox,
                    stateGame: updateGameItemData.stateGame,
                    statePaper: updateGameItemData.statePaper,
                },
            });

            return updatedGameCollectionItem;
        } catch (error) {
            throw error;
        }
    }

}