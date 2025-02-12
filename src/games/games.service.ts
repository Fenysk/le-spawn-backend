import { Injectable, NotFoundException } from '@nestjs/common';
import { ScandexService } from '../scandex/scandex.service';
import { IgdbService } from '../igdb/igdb.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GamesBankService } from './services/games-bank.service';
import { NewGameRequest } from './dto/new-game.request';
import { SearchGameDto } from './dto/search-game.request';
import { Game, Prisma } from '@prisma/client';

@Injectable()
export class GamesService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly scandexService: ScandexService,
        private readonly igdbService: IgdbService,
        private readonly gamesBankService: GamesBankService,
    ) { }

    async searchGames(searchGameDto: SearchGameDto): Promise<Game[]> {
    try {
        const whereConditions: Prisma.GameWhereInput[] = [];

        if (searchGameDto.query) {
            whereConditions.push({ name: { contains: searchGameDto.query, mode: 'insensitive' } });
        }

        if (searchGameDto.barcode) {
            whereConditions.push({ barcodes: { has: searchGameDto.barcode } });
        }

        const games = await this.prismaService.game.findMany({
            where: whereConditions.length ? { OR: whereConditions } : {}
        });

        if (!games.length) {
            throw new NotFoundException('No games found matching the search criteria');
        }

        return games;
    } catch (error) {
        throw error;
    }
}

    async getGameWithBarcode(barcode: string): Promise<Game> {
        try {
            const game = await this.gamesBankService.getGameWithBarcode(barcode);

            return game;
        } catch (error) {
            const scanDexGameInfo = await this.scandexService.lookup({ barcode: Number(barcode) });

            const igdbGame = await this.igdbService.getGameById(scanDexGameInfo.igdb_metadata.id);

            const newGameRequest: NewGameRequest = {
                barcodes: [barcode],
                category: igdbGame.category,
                firstReleaseDate: new Date(igdbGame.first_release_date * 1000),
                franchises: igdbGame.franchises.map(franchise => franchise.name),
                genres: igdbGame.genres.map(genre => genre.name),
                igdbGameId: igdbGame.id,
                name: igdbGame.name,
                screenshotsUrl: igdbGame.screenshots.map(screenshot => this.igdbService.getScreenshotFullUrl(screenshot.url)),
                storyline: igdbGame.storyline,
                summary: igdbGame.summary,
                coverUrl: this.igdbService.getGameCoverFullUrl(igdbGame.cover.url),
                // TODO: implement platforms
            }

            const newGame = await this.gamesBankService.addGameToBank(newGameRequest);

            return newGame;
        }
    }

}
