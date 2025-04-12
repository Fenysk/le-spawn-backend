import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { GamesBankService } from '@/bank/games/games-bank.service';
import { Collection, Game, GameCollectionItem } from '@prisma/client';
import { UpdateGameItemInCollectionRequest } from '@/collections/dto/update-game-item-in-collection.request';
import { AddGameItemToCollectionRequest } from '../dto/add-game-item-to-collection.request';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GamesCollectionEventNames } from '../events/games-collection.events';

@Injectable()
export class GamesCollectionService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly gamesBankService: GamesBankService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    /** Experimental */
    async addGameToCollection(
        userId: string,
        gameItemData: AddGameItemToCollectionRequest
    ): Promise<GameCollectionItem> {
        const { collectionId, frontGameImageUrl: frontImageUrl, backGameImageUrl: backImageUrl, barcode } = gameItemData;

        let collection : Collection;
        
        if (collectionId) 
            collection = await this.prismaService.collection.findUnique({ where: { id: collectionId } });
        else 
            collection = await this.prismaService.collection.findFirst({ where: { userId } });
        
        if (!collection || collection.userId !== userId) 
            throw new UnauthorizedException('Unauthorized');
        
        const newGameItem = await this.prismaService.gameCollectionItem.create({
            data: {
                collection: { connect: { id: collection.id } },
                frontImageUrl,
                backImageUrl,
            },
        });

        this.eventEmitter.emit(GamesCollectionEventNames.NEW_GAME_ITEM_ADDED, {
            newGameItem,
            barcode,
        });

        return newGameItem;
    }

    async assignGameToItem(gameItem: GameCollectionItem, game: Game): Promise<void> {
        const existingGameItem = await this.prismaService.gameCollectionItem.findUnique({
            where: { id: gameItem.id },
            select: { gameId: true },
        });

        if (existingGameItem?.gameId)
            throw new ConflictException('Game already associated with this item');

        await this.prismaService.gameCollectionItem.update({
            where: { id: gameItem.id },
            data: { game: { connect: { id: game.id } } },
        });
    }
    /*****************/

    async getGameItemById(
        userId: string,
        gameItemId: string
    ): Promise<GameCollectionItem> {
        return this.prismaService.gameCollectionItem.findUnique({
            where: { id: gameItemId },
            include: { game: true }
        });
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