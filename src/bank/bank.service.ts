import { Injectable } from '@nestjs/common';
import { ScandexService } from '../scandex/scandex.service';
import { IgdbService } from '../igdb/igdb.service';
import { GamesBankService } from './games/games-bank.service';
import { NewGameRequest } from './dto/new-game.request';
import { Game } from '@prisma/client';
import { PlatformsBankService } from './platforms/platforms-bank.service';
import { NewPlatformRequest } from './dto/new-platform.request';

@Injectable()
export class BankService {
    constructor(
        private readonly scandexService: ScandexService,
        private readonly igdbService: IgdbService,
        private readonly gamesBankService: GamesBankService,
        private readonly platformsBankService: PlatformsBankService
    ) { }

    async getGameFromBarcode(barcode: string): Promise<Game> {
        try {
            const games = await this.gamesBankService.searchGames({ barcode });

            return games[0];
        } catch (error) {
            const scanDexGameInfo = await this.scandexService.lookup({ barcode: Number(barcode) });

            const igdbGame = await this.igdbService.getGameById(scanDexGameInfo.igdb_metadata.id);

            console.log(igdbGame.platforms);

            const platforms = await Promise.all(igdbGame.platforms.map(async platformFromIgdb => {
                console.log('Trying platform Igdb Id: ', platformFromIgdb.id);
                try {
                    return await this.platformsBankService.getPlatformWithIgdbId(+platformFromIgdb.id);
                } catch (error) {
                    try {
                        const igdbPlatform = await this.igdbService.getPlatformById(+platformFromIgdb.id);

                        const platformData: NewPlatformRequest = {
                            igdbPlatformId: +platformFromIgdb.id,
                            name: igdbPlatform.name,
                            abbreviation: igdbPlatform.abbreviation,
                            generation: igdbPlatform.generation
                        }

                        return await this.platformsBankService.addPlatformToBank(platformData);
                    } catch (error) {
                        throw error;
                    }
                }
            }));

            const newGameRequest: NewGameRequest = {
                barcodes: [barcode],
                category: igdbGame.category,
                firstReleaseDate: new Date(igdbGame.first_release_date * 1000),
                franchises: igdbGame.franchises.map(franchise => franchise.name) || [],
                genres: igdbGame.genres.map(genre => genre.name),
                igdbGameId: igdbGame.id,
                name: igdbGame.name,
                screenshotsUrl: igdbGame.screenshots.map(screenshot => this.igdbService.getScreenshotFullUrl(screenshot.url)),
                storyline: igdbGame.storyline,
                summary: igdbGame.summary,
                coverUrl: this.igdbService.getGameCoverFullUrl(igdbGame.cover.url),
                platformIds: platforms.map(platform => platform.id)
            }

            const newGame = await this.gamesBankService.addGameToBank(newGameRequest);

            return newGame;
        }
    }

}
