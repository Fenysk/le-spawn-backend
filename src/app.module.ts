import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { IgdbModule } from './igdb/igdb.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { TwitchModule } from './twitch/twitch.module';
import { PrismaModule } from './prisma/prisma.module';
import { BankModule } from './bank/bank.module';
import { CollectionsModule } from './collections/collections.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BarcodeProviderModule } from './barcode-provider/barcode-provider.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    IgdbModule,
    BankModule,
    CommonModule,
    TwitchModule,
    CollectionsModule,
    UsersModule,
    BarcodeProviderModule,
    ReportsModule,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
