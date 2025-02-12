import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewGameRequest } from '../dto/new-game.request';
import { Game } from '@prisma/client';
import { getGameCategoryEnum } from 'src/igdb/enum/game-category.enum';
import { IgdbService } from 'src/igdb/igdb.service';

@Injectable()
export class GamesBankService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly igdbService: IgdbService,
    ) { }

    async getGameWithBarcode(barcode: string): Promise<Game> {
        try {
            const game = await this.prismaService.game.findFirst({
                where: {
                    barcodes: {
                        has: barcode
                    }
                }
            })

            if (!game)
                throw new NotFoundException('Game not found in bank');

            return game;
        } catch (error) {
            throw error;
        }
    }

    async addGameToBank(
        gameData: NewGameRequest
    ): Promise<Game> {
        const category = getGameCategoryEnum(gameData.category);
        const coverFullUrl = this.igdbService.getGameCoverFullUrl(gameData.coverUrl);

        try {
            const newGame = await this.prismaService.game.create({
                data: {
                    igdbGameId: gameData.igdbGameId,
                    barcodes: gameData.barcodes,
                    category: category,
                    coverUrl: coverFullUrl,
                    firstReleaseDate: gameData.firstReleaseDate,
                    franchises: gameData.franchises,
                    genres: gameData.genres,
                    name: gameData.name,
                    screenshotsUrl: gameData.screenshotsUrl,
                    storyline: gameData.storyline,
                    summary: gameData.summary,
                    platformsRelation: {
                        create: gameData.platformIds.map(platformId => ({
                            platform: {
                                connect: {
                                    id: platformId
                                }
                            }
                        }))
                    }
                }
            })

            return newGame;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
