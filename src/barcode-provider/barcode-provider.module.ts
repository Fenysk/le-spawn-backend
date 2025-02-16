import { Module } from '@nestjs/common';
import { ScandexService } from './scandex/scandex.service';
import { UpcitemdbService } from './upcitemdb/upcitemdb.service';
import { CommonModule } from 'src/common/common.module';
import { PricechartingService } from './pricecharting/pricecharting.service';
import { PricechartingController } from './pricecharting/pricecharting.controller';
import { ScandexController } from './scandex/scandex.controller';
import { UpcitemdbController } from './upcitemdb/upcitemdb.controller';

@Module({
    controllers: [
        PricechartingController,
        ScandexController,
        UpcitemdbController
    ],
    imports: [
        CommonModule,
    ],
    providers: [ScandexService, UpcitemdbService, PricechartingService],
    exports: [ScandexService, UpcitemdbService, PricechartingService],
})
export class BarcodeProviderModule { }
