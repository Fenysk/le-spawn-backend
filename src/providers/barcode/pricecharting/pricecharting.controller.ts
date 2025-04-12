import { Controller, Get, Param } from '@nestjs/common';
import { PricechartingService } from './pricecharting.service';

@Controller('pricecharting')
export class PricechartingController {
    constructor(
        private readonly pricechartingService: PricechartingService
    ) { }

    @Get('lookup/:barcode')
    lookup(
        @Param('barcode') barcode: string
    ) {
        return this.pricechartingService.lookup({ barcode });
    }
}
