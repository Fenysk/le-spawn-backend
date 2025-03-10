import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { IgdbModule } from './providers/igdb/igdb.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { BankModule } from './bank/bank.module';
import { CollectionsModule } from './collections/collections.module';
import { AuthModule } from './core/auth/auth.module';
import { UsersModule } from './core/users/users.module';
import { BarcodeProviderModule } from '@/providers/barcode/barcode-provider.module';
import { ReportsModule } from './reports/reports.module';
import { AnalyzeModule } from './analyze/analyze.module';
import { StorageModule } from './storage/storage.module';
import { AppController } from './app.controller';
import { RegionModule } from './bank/region/region.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    IgdbModule,
    BankModule,
    CommonModule,
    CollectionsModule,
    UsersModule,
    BarcodeProviderModule,
    ReportsModule,
    AnalyzeModule,
    StorageModule,
    RegionModule,
  ],
  providers: [
    AppService,
  ],
  controllers: [
    AppController,
  ],
})
export class AppModule { }
