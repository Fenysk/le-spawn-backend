import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { GamesBankService } from '@/bank/games/games-bank.service';
import { SearchGamesRequest } from '@/bank/dto/search-games.request';
import { Game } from '@prisma/client';
import { BankService } from '@/bank/bank.service';
import { AddBarcodeToGameRequest } from '@/bank/dto/add-barcode-to-game.request';
import { GetGamesFromImagesRequest } from '../dto/get-games-from-images.request';

@Controller('bank/games')
export class GamesController {
    constructor(
        private readonly gamesBankService: GamesBankService,
        private readonly bankService: BankService
    ) { }

    @Get('search')
    async searchGamesInBank(
        @Body() searchGamesDto: SearchGamesRequest
    ): Promise<Game[]> {
        return this.gamesBankService.searchGamesInBank(searchGamesDto);
    }

    @Get('providers')
    async searchGamesInProviders(
        @Body() searchGamesDto: SearchGamesRequest
    ) {
        return this.gamesBankService.searchGamesInProviders(searchGamesDto);
    }

    @Get('barcode/:barcode')
    async getGamesWithBarcode(
        @Param('barcode') barcode: string
    ): Promise<Game[]> {
        return this.bankService.getGamesFromBarcode(barcode);
    }

    @Get('images')
    async fetchGamesFromImages(
        @Body() request: GetGamesFromImagesRequest
    ): Promise<Game[]> {
        return this.bankService.fetchGamesFromImages(request);
    }

    @Put('barcode')
    async addBarcodeToGame(
        @Body() data: AddBarcodeToGameRequest
    ): Promise<Game> {
        return this.gamesBankService.addBarcodeToGame(data);
    }
}
