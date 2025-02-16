import { Module } from '@nestjs/common';
import { UpcitemdbController } from './upcitemdb.controller';
import { UpcitemdbService } from './upcitemdb.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CommonModule,
  ],
  controllers: [UpcitemdbController],
  providers: [UpcitemdbService],
  exports: [UpcitemdbService],
})
export class UpcitemdbModule { }
