import { Controller, Get, Param } from '@nestjs/common';
import { ScandexService } from './scandex.service';

@Controller('scandex')
export class ScandexController {
    constructor(
        private readonly scandexService: ScandexService
    ) { }

    @Get('lookup/:barcode')
    lookup(
        @Param('barcode') barcode: string
    ) {
        return this.scandexService.lookup({ barcode });
    }
}
