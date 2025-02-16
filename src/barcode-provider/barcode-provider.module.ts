import { Module } from '@nestjs/common';
import { ScandexService } from './scandex/scandex.service';
import { UpcitemdbService } from './upcitemdb/upcitemdb.service';
import { CommonModule } from 'src/common/common.module';
import { PricechartingService } from './pricecharting/pricecharting.service';
import { PricechartingController } from './pricecharting/pricecharting.controller';
import { ScandexController } from './scandex/scandex.controller';
import { UpcitemdbController } from './upcitemdb/upcitemdb.controller';
import { BarcodespiderService } from './barcodespider/barcodespider.service';
import { BarcodespiderController } from './barcodespider/barcodespider.controller';

@Module({
    controllers: [
        PricechartingController,
        ScandexController,
        UpcitemdbController,
        BarcodespiderController
    ],
    imports: [
        CommonModule,
    ],
    providers: [ScandexService, UpcitemdbService, PricechartingService, BarcodespiderService],
    exports: [ScandexService, UpcitemdbService, PricechartingService, BarcodespiderService],
})
export class BarcodeProviderModule { }
