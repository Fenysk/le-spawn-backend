import { Injectable} from '@nestjs/common';
import { ScandexService } from '../scandex/scandex.service';
import { IgdbService } from '../igdb/igdb.service';

@Injectable()
export class GamesService {
    constructor(
        private readonly scandexService: ScandexService,
        private readonly igdbService: IgdbService
    ) { }

    async searchGameWithBarcode(barcode: string) {
        try {
            const { igdb_metadata: { id: igbdGameId } } = await this.scandexService.lookup({ barcode: Number(barcode) });

            const igdbGame = await this.igdbService.getGameById(igbdGameId);

            return igdbGame;
        } catch (error) {
            throw error;
        }
    }
}
