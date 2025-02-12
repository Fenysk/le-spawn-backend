import { Body, Controller, Get, Param } from '@nestjs/common';
import { GamesBankService } from './games-bank.service';
import { SearchGamesRequest } from '../dto/search-games.request';
import { Game } from '@prisma/client';
import { BankService } from '../bank.service';

@Controller('games')
export class GamesController {
    constructor(
        private readonly gamesBankService: GamesBankService,
        private readonly bankService: BankService
    ) { }

    @Get()
    async searchGames(
        @Body() searchGameDto: SearchGamesRequest
    ): Promise<Game[]> {
        return this.gamesBankService.searchGames(searchGameDto);
    }

    @Get('barcode/:barcode')
    async getGameWithBarcode(
        @Param('barcode') barcode: string
    ): Promise<Game> {
        return this.bankService.getGameFromBarcode(barcode);
    }
}
