import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { GameReportsService } from './reports.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [GameReportsService],
  exports: [GameReportsService]
})
export class ReportsModule {} 