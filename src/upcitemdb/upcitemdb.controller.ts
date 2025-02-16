import { Controller, Get, Param } from '@nestjs/common';
import { UpcitemdbService } from './upcitemdb.service';

@Controller('upcitemdb')
export class UpcitemdbController {
    constructor(
        private readonly upcitemdbService: UpcitemdbService
    ) { }

    @Get('lookup/:barcode')
    lookup(
        @Param('barcode') barcode: number
    ) {
        return this.upcitemdbService.lookup({ barcode });
    }
}
