import { Module } from '@nestjs/common';
import { ScandexService } from './scandex/scandex.service';
import { UpcitemdbService } from './upcitemdb/upcitemdb.service';
import { CommonModule } from '@/common/common.module';
import { PricechartingService } from './pricecharting/pricecharting.service';
import { PricechartingController } from './pricecharting/pricecharting.controller';
import { ScandexController } from './scandex/scandex.controller';
import { UpcitemdbController } from './upcitemdb/upcitemdb.controller';
import { BarcodespiderService } from './barcodespider/barcodespider.service';
import { BarcodespiderController } from './barcodespider/barcodespider.controller';

@Module({
    imports: [
        CommonModule,
    ],
    controllers: [
        PricechartingController,
        ScandexController,
        UpcitemdbController,
        BarcodespiderController
    ],
    providers: [ScandexService, UpcitemdbService, PricechartingService, BarcodespiderService],
    exports: [ScandexService, UpcitemdbService, PricechartingService, BarcodespiderService],
})
export class BarcodeProviderModule { }
