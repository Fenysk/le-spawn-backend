import { Controller, Get, Param } from '@nestjs/common';
import { UpcitemdbService } from './upcitemdb.service';
import { UpcitemdbApiResponse } from './interface/upcitemdb-api.response';

@Controller('upcitemdb')
export class UpcitemdbController {
    constructor(
        private readonly upcitemdbService: UpcitemdbService
    ) { }

    @Get('lookup/:barcode')
    lookup(
        @Param('barcode') barcode: number
    ): Promise<UpcitemdbApiResponse> {
        return this.upcitemdbService.lookup({ barcode });
    }
}
