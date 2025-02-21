import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Game, Prisma } from '@prisma/client';
import { GameCategoryEnumInt, getGameCategoryEnum } from '@/igdb/enum/game-category.enum';
import { IgdbService } from '@/igdb/igdb.service';
import { PrismaService } from '@/prisma/prisma.service';
import { BankService } from '@/bank/bank.service';
import { AddBarcodeToGameRequest } from '@/bank/dto/add-barcode-to-game.request';
import { NewGameRequest } from '@/bank/dto/new-game.request';
import { SearchGamesRequest } from '@/bank/dto/search-games.request';

@Injectable()
export class GamesBankService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly igdbService: IgdbService,

        @Inject(forwardRef(() => BankService))
        private readonly bankService: BankService,
    ) { }

    async searchGamesInBank(searchGamesDto: SearchGamesRequest): Promise<Game[]> {
        const whereConditions: Prisma.GameWhereInput[] = [];

        if (searchGamesDto.id)
            whereConditions.push({ id: searchGamesDto.id });

        if (searchGamesDto.query)
            whereConditions.push({ name: { contains: searchGamesDto.query, mode: 'insensitive' } });

        if (searchGamesDto.barcode)
            whereConditions.push({ barcodes: { has: searchGamesDto.barcode } });

        const games = await this.prismaService.game.findMany({
            where: {
                AND: [
                    whereConditions.length ? { OR: whereConditions } : {},
                    { isIgdbBanned: false }
                ]
            },
            include: {
                platformsRelation: {
                    include: {
                        platform: true
                    }
                }
            }
        });

        if (!games.length)
            throw new NotFoundException('No games found matching the search criteria');

        return games;
    }

    async searchGamesInProviders(searchGamesDto: SearchGamesRequest) {
        try {
            const igdbGames = await this.igdbService.getGamesFromName(searchGamesDto.query);

            const newGames = await this.bankService.addNewGameFromIgdbGames(igdbGames);

            return newGames;
        } catch (error) {
            throw error;
        }
    }

    async addGameToBank(
        gameData: NewGameRequest
    ): Promise<Game> {
        const category = getGameCategoryEnum(gameData.category);
        const coverFullUrl = this.igdbService.getGameCoverFullUrl(gameData.coverUrl);

        const isIgdbBanned = [
            GameCategoryEnumInt.mod,
            GameCategoryEnumInt.fork,
            GameCategoryEnumInt.update,
            GameCategoryEnumInt.dlcAddon,
        ].includes(gameData.category);

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
                    isIgdbBanned: isIgdbBanned,
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
                },
                include: {
                    platformsRelation: {
                        include: {
                            platform: true
                        }
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
