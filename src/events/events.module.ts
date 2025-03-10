import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { BankModule } from '@/bank/bank.module';
import { CollectionsModule } from '@/collections/collections.module';
import { AnalyzeModule } from '@/analyze/analyze.module';

@Module({
  imports: [BankModule, CollectionsModule, AnalyzeModule],
  providers: [EventsService]
})
export class EventsModule {}
