import { Body, Controller, Get, Param } from '@nestjs/common';
import { GamesService } from './games.service';
import { Game } from '@prisma/client';
import { SearchGamesRequest } from './dto/search-games.request';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }

    @Get()
    async searchGames(
        @Body() searchGameDto: SearchGamesRequest
    ): Promise<Game[]> {
        return this.gamesService.searchGames(searchGameDto);
    }

    @Get('barcode/:barcode')
    async getGameWithBarcode(
        @Param('barcode') barcode: string
    ): Promise<Game> {
        return this.gamesService.getGameWithBarcode(barcode);
    }


}
