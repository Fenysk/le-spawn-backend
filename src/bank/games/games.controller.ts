import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { GamesBankService } from '@/bank/games/games-bank.service';
import { SearchGamesRequest } from '@/bank/dto/search-games.request';
import { Game } from '@prisma/client';
import { BankService } from '@/bank/bank.service';
import { AddBarcodeToGameRequest } from '@/bank/dto/add-barcode-to-game.request';

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
    async getGameWithBarcode(
        @Param('barcode') barcode: string
    ): Promise<Game[]> {
        return this.bankService.getGamesFromBarcode(barcode);
    }

    @Put('barcode')
    async addBarcodeToGame(
        @Body() data: AddBarcodeToGameRequest
    ): Promise<Game> {
        return this.gamesBankService.addBarcodeToGame(data);
    }
}
