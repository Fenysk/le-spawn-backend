import { Module } from '@nestjs/common';
import { ReportsController } from './game-reports.controller';
import { GameReportsService } from './game-reports.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [GameReportsService],
  exports: [GameReportsService]
})
export class ReportsModule {} 