import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ScandexService } from '../scandex/scandex.service';
import { IgdbService } from '../igdb/igdb.service';
import { GamesBankService } from './games/games-bank.service';
import { NewGameRequest } from './dto/new-game.request';
import { Game } from '@prisma/client';
import { PlatformsBankService } from './platforms/platforms-bank.service';
import { NewPlatformRequest } from './dto/new-platform.request';
import { IGDBGameResponse } from 'src/igdb/interface/igdb-game.response';
import { UpcitemdbService } from 'src/upcitemdb/upcitemdb.service';

@Injectable()
export class BankService {
    constructor(
        private readonly scandexService: ScandexService,
        private readonly igdbService: IgdbService,
        private readonly gamesBankService: GamesBankService,
        private readonly platformsBankService: PlatformsBankService,
        private readonly upcitemdbService: UpcitemdbService
    ) { }

    async getGamesFromBarcode(barcode: string): Promise<Game[]> {
        try {
            const games = await this.gamesBankService.searchGames({ barcode });
            return games;
        } catch (error) {
            let igdbGames: IGDBGameResponse[] = [];

            if (!igdbGames.length) {
                try {
                    const upcitemdbGameInfo = await this.upcitemdbService.lookup({ barcode: Number(barcode) });
                    for (const item of upcitemdbGameInfo.items) {
                        igdbGames = await this.igdbService.getGamesFromName(item.title);
                    }
                } catch (error) {
                    if (error instanceof ServiceUnavailableException)
                        console.log('Upcitemdb API is unavailable');
                    else
                        console.error('No game found in Upcitemdb API');
                }
            }

            if (!igdbGames.length) {
                try {
                    const scanDexGameInfo = await this.scandexService.lookup({ barcode: Number(barcode) });
                    igdbGames = await this.igdbService.getGameById(scanDexGameInfo.igdb_metadata.id);
                } catch (error) {
                    console.error('No game found in ScanDex API');
                }
            }

            if (!igdbGames.length) {
                throw new NotFoundException('Game not found');
            }

            const newGames = await Promise.all(igdbGames.map(async (igdbGame) => {
                const platforms = await Promise.all((igdbGame.platforms || []).map(async platformFromIgdb => {
                    try {
                        return await this.platformsBankService.getPlatformWithIgdbId(+platformFromIgdb.id);
                    } catch (error) {
                        const igdbPlatform = await this.igdbService.getPlatformById(+platformFromIgdb.id);
                        const platformData: NewPlatformRequest = {
                            igdbPlatformId: +platformFromIgdb.id,
                            name: igdbPlatform.name,
                            abbreviation: igdbPlatform.abbreviation,
                            generation: igdbPlatform.generation
                        };
                        return await this.platformsBankService.addPlatformToBank(platformData);
                    }
                }));

                const barcodes = igdbGames.length === 1 ? [barcode] : [];

                const newGameRequest: NewGameRequest = {
                    barcodes: barcodes,
                    category: igdbGame.category,
                    firstReleaseDate: new Date(igdbGame.first_release_date * 1000),
                    franchises: (igdbGame.franchises || []).map(franchise => franchise.name),
                    genres: (igdbGame.genres || []).map(genre => genre.name),
                    igdbGameId: igdbGame.id,
                    name: igdbGame.name,
                    screenshotsUrl: (igdbGame.screenshots || []).map(screenshot => this.igdbService.getScreenshotFullUrl(screenshot.url)),
                    storyline: igdbGame.storyline,
                    summary: igdbGame.summary,
                    coverUrl: igdbGame.cover ? this.igdbService.getGameCoverFullUrl(igdbGame.cover.url) : undefined,
                    platformIds: platforms.map(platform => platform.id)
                };

                return await this.gamesBankService.addGameToBank(newGameRequest);
            }));

            return newGames;
        }
    }
}
