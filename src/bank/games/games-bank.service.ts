import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewGameRequest } from '../dto/new-game.request';
import { Game, Prisma } from '@prisma/client';
import { getGameCategoryEnum } from 'src/igdb/enum/game-category.enum';
import { IgdbService } from 'src/igdb/igdb.service';
import { SearchGamesRequest } from '../dto/search-games.request';
import { AddBarcodeToGameRequest } from '../dto/add-barcode-to-game.request';

@Injectable()
export class GamesBankService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly igdbService: IgdbService,
    ) { }

    async searchGames(searchGamesDto: SearchGamesRequest): Promise<Game[]> {
        try {
            const whereConditions: Prisma.GameWhereInput[] = [];

            if (searchGamesDto.id)
                whereConditions.push({ id: searchGamesDto.id });

            if (searchGamesDto.query)
                whereConditions.push({ name: { contains: searchGamesDto.query, mode: 'insensitive' } });

            if (searchGamesDto.barcode)
                whereConditions.push({ barcodes: { has: searchGamesDto.barcode } });

            const games = await this.prismaService.game.findMany({
                where: whereConditions.length ? { OR: whereConditions } : {}
            });

            if (!games.length)
                throw new NotFoundException('No games found matching the search criteria');

            return games;
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
            const existingGame = await this.prismaService.game.findUnique({
                where: {
                    igdbGameId: gameData.igdbGameId
                }
            });

            if (existingGame)
                return existingGame;

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
            });

            return newGame;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async addBarcodeToGame(data: AddBarcodeToGameRequest): Promise<Game> {

        const game = await this.prismaService.game.findUnique({ where: { id: data.gameId } });

        if (!game)
            throw new NotFoundException('Game not found');

        if (game.barcodes.includes(data.barcode))
            throw new ConflictException('Barcode already exists for this game');

        try {
            const updatedGame = await this.prismaService.game.update({
                where: { id: data.gameId },
                data: {
                    barcodes: {
                        push: data.barcode
                    }
                }
            });

            return updatedGame;
        } catch (error) {
            throw error;
        }
    }

}
