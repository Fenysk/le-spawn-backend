import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddGameItemToCollectionRequest } from '../dto/add-game-item-to-collection.request';
import { GamesBankService } from 'src/bank/games/games-bank.service';
import { GameCollectionItem } from '@prisma/client';

@Injectable()
export class GamesCollectionService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly gamesBankService: GamesBankService,
    ) { }

    async getGamesCollection(): Promise<GameCollectionItem[]> {
        try {
            return await this.prismaService.gameCollectionItem.findMany({
                include: {
                    game: true
                }
            });
        } catch (error) {
            throw new Error(`Failed to retrieve games collection: ${error.message}`);
        }
    }


    async addGameToCollection(
        gameItemData: AddGameItemToCollectionRequest
    ): Promise<GameCollectionItem> {
        try {
            const isGameExist = await this.gamesBankService.searchGames({ id: gameItemData.gameId });

            const newGameCollectionItem = await this.prismaService.gameCollectionItem.create({
                data: {
                    hasBox: gameItemData.hasBox,
                    hasGame: gameItemData.hasGame,
                    hasPaper: gameItemData.hasPaper,
                    stateBox: gameItemData.stateBox,
                    stateGame: gameItemData.stateGame,
                    statePaper: gameItemData.statePaper,
                    game: { connect: { id: gameItemData.gameId } }
                }
            });

            return newGameCollectionItem;
        } catch (error) {
            throw new Error(`Failed to add game to collection: ${error.message}`);
        }
    }

}