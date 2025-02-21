import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ScandexService } from '@/barcode-provider/scandex/scandex.service';
import { IgdbService } from '@/igdb/igdb.service';
import { GamesBankService } from '@/bank/games/games-bank.service';
import { NewGameRequest } from '@/bank/dto/new-game.request';
import { Game } from '@prisma/client';
import { PlatformsBankService } from '@/bank/platforms/platforms-bank.service';
import { NewPlatformRequest } from '@/bank/dto/new-platform.request';
import { IGDBGameResponse } from '@/igdb/interface/igdb-game.response';
import { UpcitemdbService } from '@/barcode-provider/upcitemdb/upcitemdb.service';
import { PricechartingService } from '@/barcode-provider/pricecharting/pricecharting.service';
import { BarcodespiderService } from '@/barcode-provider/barcodespider/barcodespider.service';

@Injectable()
export class BankService {
    constructor(
        @Inject(forwardRef(() => GamesBankService))
        private readonly gamesBankService: GamesBankService,        
        private readonly scandexService: ScandexService,
        private readonly igdbService: IgdbService,
        private readonly platformsBankService: PlatformsBankService,
        private readonly upcitemdbService: UpcitemdbService,
        private readonly pricechartingService: PricechartingService,
        private readonly barcodespiderService: BarcodespiderService,
    ) { }

    private fromUnixTimestamp(timestamp: number): Date {
        return new Date(timestamp * 1000);
    }

    private async checkOtherPossibilities(productName: string): Promise<IGDBGameResponse[]> {
        const wordsInProductName = productName.split(' ');
        const totalWords = wordsInProductName.length;

        for (let numberOfWordsToKeep = totalWords; numberOfWordsToKeep > 0; numberOfWordsToKeep--) {
            const searchTermToTry = wordsInProductName
                .slice(0, numberOfWordsToKeep)
                .join(' ');

            try {
                const gamesFound = await this.igdbService.getGamesFromName(searchTermToTry);
                if (gamesFound.length > 0) {
                    return gamesFound;
                }
            } catch (error) {
                if (error?.response?.statusCode !== 404) {
                    throw error;
                }
            }
        }

        return [];
    }

    async getGamesFromBarcode(barcode: string): Promise<Game[]> {
        try {
            const games = await this.gamesBankService.searchGamesInBank({ barcode });
            return games;
        } catch (error) {
            let igdbGames: IGDBGameResponse[] = [];

            if (!igdbGames.length)
                igdbGames = await this.fetchFromPriceCharting(barcode);

            if (!igdbGames.length)
                igdbGames = await this.fetchFromUpcitemdb(barcode);

            if (!igdbGames.length)
                igdbGames = await this.fetchFromScandex(barcode);

            if (!igdbGames.length)
                igdbGames = await this.fetchFromBarcodespider(barcode);

            if (!igdbGames.length) {
                throw new NotFoundException('Game not found');
            }

            const newGames = await this.addNewGameFromIgdbGames(igdbGames, barcode);

            return newGames;
        }
    }

    async addNewGameFromIgdbGames(igdbGames: IGDBGameResponse[], barcode?: string) {
        return await Promise.all(igdbGames.map(async (igdbGame) => {
            const platforms = await Promise.all((igdbGame.platforms || []).map(async (platformFromIgdb) => {
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

            const barcodes = barcode && igdbGames.length === 1 ? [barcode] : [];

            const releaseDate = igdbGame.first_release_date
                ? this.fromUnixTimestamp(igdbGame.first_release_date)
                : null;

            const newGameRequest: NewGameRequest = {
                barcodes: barcodes,
                category: igdbGame.category,
                firstReleaseDate: releaseDate,
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
    }

    private async fetchFromBarcodespider(barcode: string): Promise<IGDBGameResponse[]> {
        let igdbGames: IGDBGameResponse[] = [];
        try {
            const barcodespiderInfo = await this.barcodespiderService.lookup({ barcode });
            const productName = barcodespiderInfo.item_attributes.title;

            try {
                igdbGames = await this.igdbService.getGamesFromName(productName);
            } catch (error) {
                if (error?.response?.statusCode === 404) {
                    igdbGames = [];
                } else {
                    throw error;
                }
            }

            if (!igdbGames.length && productName.includes(' '))
                igdbGames = await this.checkOtherPossibilities(productName);

        } catch (error) {
            console.error('No game found in Barcodespider API');
        }
        return igdbGames;
    }

    private async fetchFromScandex(barcode: string): Promise<IGDBGameResponse[]> {
        let igdbGames: IGDBGameResponse[] = [];
        try {
            const scanDexGameInfo = await this.scandexService.lookup({ barcode: barcode });
            igdbGames = await this.igdbService.getGameById(scanDexGameInfo.igdb_metadata.id);
        } catch (error) {
            console.error('No game found in ScanDex API');
        }
        return igdbGames;
    }

    private async fetchFromUpcitemdb(barcode: string): Promise<IGDBGameResponse[]> {
        let igdbGames: IGDBGameResponse[] = [];
        try {
            const upcitemdbGameInfo = await this.upcitemdbService.lookup({ barcode: Number(barcode) });
            for (const item of upcitemdbGameInfo.items) {
                const productName = item.title;

                try {
                    igdbGames = await this.igdbService.getGamesFromName(productName);
                } catch (error) {
                    if (error?.response?.statusCode === 404) {
                        igdbGames = [];
                    } else {
                        throw error;
                    }
                }

                if (!igdbGames.length && productName.includes(' '))
                    igdbGames = await this.checkOtherPossibilities(productName);

            }
        } catch (error) {
            console.error('No game found in Upcitemdb API');
        }
        return igdbGames;
    }

    private async fetchFromPriceCharting(barcode: string): Promise<IGDBGameResponse[]> {
        let igdbGames: IGDBGameResponse[] = [];
        try {
            const pricechartingGameInfo = await this.pricechartingService.lookup({ barcode });

            const productName = pricechartingGameInfo['product-name'];
            try {
                igdbGames = await this.igdbService.getGamesFromName(productName);
            } catch (error) {
                if (error?.response?.statusCode === 404) {
                    igdbGames = [];
                } else {
                    throw error;
                }
            }
            if (!igdbGames.length && productName.includes(' '))
                igdbGames = await this.checkOtherPossibilities(productName);

        } catch (error) {
            console.error('No game found in PriceCharting API');
        }

        return igdbGames;
    }

}
