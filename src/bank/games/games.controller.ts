import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { GamesBankService } from './games-bank.service';
import { SearchGamesRequest } from '../dto/search-games.request';
import { Game } from '@prisma/client';
import { BankService } from '../bank.service';
import { AddBarcodeToGameRequest } from '../dto/add-barcode-to-game.request';

@Controller('games')
export class GamesController {
    constructor(
        private readonly gamesBankService: GamesBankService,
        private readonly bankService: BankService
    ) { }

    @Get()
    async searchGames(
        @Body() searchGamesDto: SearchGamesRequest
    ): Promise<Game[]> {
        return this.gamesBankService.searchGames(searchGamesDto);
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
