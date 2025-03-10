import { AnalyzeService } from '@/analyze/analyze.service';
import { GameAnalyzeResponse } from '@/analyze/dto/game-analyze.response';
import { BankService } from '@/bank/bank.service';
import { GamesBankService } from '@/bank/games/games-bank.service';
import { GamesCollectionEventNames } from '@/collections/events/games-collection.events';
import { GamesCollectionService } from '@/collections/games/games-collection.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Game, GameCollectionItem } from '@prisma/client';

@Injectable()
export class EventsService {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly gamesBankService: GamesBankService,
        private readonly bankService: BankService,
        private readonly gamesCollectionService: GamesCollectionService,
        private readonly analyzeService: AnalyzeService
    ) { }

    @OnEvent(GamesCollectionEventNames.NEW_GAME_ITEM_ADDED)
    async handleNewGameItemAdded({
        newGameItem,
        barcode,
    }: {
        newGameItem: GameCollectionItem;
        barcode?: string;
    }) {
        console.log('Handling new game item added event');
        if (barcode)
            await this.processWithBarcode(newGameItem, barcode);
        else
            await this.processWithImages(newGameItem);
    }

    private async processWithBarcode(newGameItem: GameCollectionItem, barcode: string): Promise<void> {
        console.log('Processing game item with barcode');
        try {
            const games = await this.gamesBankService.searchGamesInBank({ barcode });

            if (games.length === 1)
                return await this.handleSingleGameFromAppDBFoundWithBarcode(newGameItem, games[0], barcode);

            return await this.handleMultipleGamesFromAppDBFoundWithBarcode(newGameItem, games);
        } catch (error) {
            if (error.status === 404)
                return await this.handleNoGamesFromAppDBFoundWithBarcode(newGameItem, barcode);

            return await this.handleBarcodeSearchError(newGameItem, barcode, error);
        }
    }

    private async handleSingleGameFromAppDBFoundWithBarcode(
        newGameItem: GameCollectionItem,
        gameFromAppDB: Game,
        barcode: string
    ): Promise<void> {
        console.log('Handling single game found from app DB with barcode');
        try {
            const gamesFromBarcodeProvider = await this.bankService.getGamesFromBarcode(barcode);

            if (gamesFromBarcodeProvider.length === 0)
                return await this.assignGameToItem(newGameItem, gameFromAppDB);

            const matchingBarcodeGame = gamesFromBarcodeProvider.find(game => game.igdbGameId === gameFromAppDB.igdbGameId);

            if (matchingBarcodeGame)
                return await this.assignGameToItem(newGameItem, gameFromAppDB);

            await this.resolveGameConflict(newGameItem, gameFromAppDB, gamesFromBarcodeProvider);
        } catch (error) {
            // TODO: Gérer l'erreur lors de la vérification dans la BDD Codes-barres
            console.error('Error checking barcode database');
        }
    }

    private async resolveGameConflict(
        newGameItem: GameCollectionItem,
        appGame: Game,
        barcodeGames: Game[]
    ): Promise<void> {
        console.log('Resolving game conflict');
        // TODO: Recherche dans IGDB avec l'ID du code-barres
        // TODO: Détection d'informations contradictoires
        // TODO: L'IA analyse les images
        // TODO: L'IA compare les photos avec les deux sources
        // TODO: L'IA détermine le jeu correspondant
        // TODO: Attribuer l'ID du jeu app à l'item-jeu
    }

    private async handleMultipleGamesFromAppDBFoundWithBarcode(
        newGameItem: GameCollectionItem,
        gamesFromAppDB: Game[]
    ): Promise<void> {
        console.log('Handling multiple games found from app DB with barcode');
        // TODO: L'IA compare les photos avec les détails des jeux
        // TODO: L'IA renvoie l'ID du jeu correspondant
        // TODO: Attribuer l'ID du jeu app à l'item-jeu
    }

    private async handleNoGamesFromAppDBFoundWithBarcode(
        newGameItem: GameCollectionItem,
        barcode: string
    ): Promise<void> {
        console.log('Handling no games found from app DB with barcode');
        try {
            const gamesFromBarcode = await this.bankService.getGamesFromBarcode(barcode);

            if (gamesFromBarcode.length === 1)
                return await this.assignGameToItem(newGameItem, gamesFromBarcode[0]);

            if (gamesFromBarcode.length > 1)
                return await this.handleMultipleGamesFromAppDBFoundWithBarcode(newGameItem, gamesFromBarcode);

            const gameAnalyzeResponse = await this.analyzeImagesWithAI(newGameItem);
            await this.retrieveGamesFromAnalyzeResponse(newGameItem, gameAnalyzeResponse);
        } catch (error) {
            console.error('Error searching barcode database');
            const gameAnalyzeResponse = await this.analyzeImagesWithAI(newGameItem);
            await this.retrieveGamesFromAnalyzeResponse(newGameItem, gameAnalyzeResponse);
        }
    }

    private async handleBarcodeSearchError(
        newGameItem: GameCollectionItem,
        barcode: string,
        error: any
    ): Promise<void> {
        console.log('Handling barcode search error');
        console.error('Error searching games with barcode', error);

        try {
            const gameAnalyzeResponse = await this.analyzeImagesWithAI(newGameItem);
            await this.retrieveGamesFromAnalyzeResponse(newGameItem, gameAnalyzeResponse);
        } catch (aiError) {
            console.error('AI analysis error');
            await this.notifyManualInputRequired(newGameItem);
        }
    }

    private async processWithImages(newGameItem: GameCollectionItem): Promise<void> {
        console.log('Processing game item with images');
        try {
            const gameAnalyzeResponse = await this.analyzeImagesWithAI(newGameItem);
            await this.retrieveGamesFromAnalyzeResponse(newGameItem, gameAnalyzeResponse);
        } catch (error) {
            console.error('AI analysis error');
            await this.notifyManualInputRequired(newGameItem);
        }
    }

    private async analyzeImagesWithAI(newGameItem: GameCollectionItem): Promise<GameAnalyzeResponse> {
        console.log('Analyzing images with AI');
        const images = [newGameItem.frontImageUrl, newGameItem.backImageUrl];

        try {
            return await this.analyzeService.analyzeGameFromImages(images);
        } catch (error) {
            console.error('Error analyzing images with AI');
            throw new Error('AI analysis failed');
        }
    }

    private async retrieveGamesFromAnalyzeResponse(
        newGameItem: GameCollectionItem,
        gameAnalyzeResponse: GameAnalyzeResponse
    ): Promise<void> {
        console.log('Retrieving games from analyze response');
        const searchInBank = async (query: string | null): Promise<Game[]> => {
            if (!query) return [];
            try {
                return await this.gamesBankService.searchGamesInBank({ query });
            } catch (error) {
                console.error(`Error searching games with query "${query}"`);
                return [];
            }
        };

        const searchInProviders = async (query: string | null): Promise<Game[]> => {
            if (!query) return [];
            try {
                return await this.gamesBankService.searchGamesInProviders({ query });
            } catch (error) {
                console.error(`Error searching games with query "${query}"`);
                return [];
            }
        };

        let gamesFromAppDB: Game[] = await searchInBank(gameAnalyzeResponse.title);

        if (gamesFromAppDB.length === 0)
            gamesFromAppDB = await searchInBank(gameAnalyzeResponse.simpleTitle);

        if (gamesFromAppDB.length === 0)
            gamesFromAppDB = await searchInProviders(gameAnalyzeResponse.title);

        if (gamesFromAppDB.length === 0)
            gamesFromAppDB = await searchInProviders(gameAnalyzeResponse.simpleTitle);

        if (gamesFromAppDB.length)
            return this.handleAppGamesFoundByTitle(newGameItem, gamesFromAppDB);
        else
            return this.notifyManualInputRequired(newGameItem);
    }

    private async handleAppGamesFoundByTitle(
        newGameItem: GameCollectionItem,
        appGames: Game[]
    ): Promise<void> {
        console.log(`Handling ${appGames.length} app games found by title`);

        if (appGames.length === 1)
            return await this.assignGameToItem(newGameItem, appGames[0]);

        try {
            const gameAnalyzeResponse = await this.analyzeService.analyzeGameFromImages([newGameItem.frontImageUrl, newGameItem.backImageUrl]);
            console.log('Game analyze response', gameAnalyzeResponse);
            const correctGame = await this.analyzeService.compareGamesListFromAnalyzeResponse(gameAnalyzeResponse, appGames);
            console.log('Correct game', correctGame);

            return await this.assignGameToItem(newGameItem, correctGame);
        } catch (error) {
            console.error('Error analyzing images with AI for game comparison', error);
            return await this.notifyManualInputRequired(newGameItem);
        }
    }

    private async assignGameToItem(
        gameItem: GameCollectionItem,
        game: Game,
    ): Promise<void> {
        console.log('Assigning game to item');
        await this.gamesCollectionService.assignGameToItem(gameItem, game);
    }

    private async notifyManualInputRequired(newGameItem: GameCollectionItem): Promise<void> {
        console.log('Notifying manual input required');
        // TODO: Mettre à jour le statut de l'item-jeu
        // TODO: Notifier l'utilisateur pour saisie manuelle
        console.log(`Manual input required for game item ${newGameItem.id}`);
    }
}
