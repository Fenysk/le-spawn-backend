import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AddGameItemToCollectionRequest } from '@/collections/dto/add-game-item-to-collection.request';
import { GamesBankService } from '@/bank/games/games-bank.service';
import { GameCollectionItem } from '@prisma/client';
import { UpdateGameItemInCollectionRequest } from '@/collections/dto/update-game-item-in-collection.request';

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

            const isGameAlreadyExist = await this.gamesBankService.searchGamesInBank({ id: gameItemData.gameId });

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

    async deleteGameItemFromCollection(
        userId: string,
        gameItemId: string
    ): Promise<string> {
        try {
            const gameCollectionItem = await this.prismaService.gameCollectionItem.findUnique({
                where: { id: gameItemId },
                include: { collection: true }
            });

            if (!gameCollectionItem) {
                throw new NotFoundException('Game item not found');
            }

            if (gameCollectionItem.collection.userId !== userId) {
                throw new UnauthorizedException('Unauthorized');
            }

            await this.prismaService.gameCollectionItem.delete({
                where: { id: gameItemId }
            });

            return `Game item with ID ${gameItemId} deleted`;
        } catch (error) {
            throw error;
        }
    }


}