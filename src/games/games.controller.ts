import { Controller, Get, Param} from '@nestjs/common';
import { GamesService } from './games.service';
import { IGDBGameResponse } from 'src/igdb/interface/igdb-game.response';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('barcode/:barcode')
  searchGameWithBarcode(
    @Param('barcode') barcode: string
): Promise<IGDBGameResponse> {
    return this.gamesService.searchGameWithBarcode(barcode);
  }
}
