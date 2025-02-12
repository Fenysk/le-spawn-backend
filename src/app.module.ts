import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IgdbModule } from './igdb/igdb.module';
import { ConfigModule } from '@nestjs/config';
import { ScandexModule } from './scandex/scandex.module';
import { CommonModule } from './common/common.module';
import { TwitchModule } from './twitch/twitch.module';
import { PrismaModule } from './prisma/prisma.module';
import { BankModule } from './bank/bank.module';
import { CollectionsModule } from './collections/collections.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    IgdbModule,
    BankModule,
    ScandexModule,
    CommonModule,
    TwitchModule,
    CollectionsModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
