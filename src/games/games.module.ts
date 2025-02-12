import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { ScandexModule } from 'src/scandex/scandex.module';
import { IgdbModule } from 'src/igdb/igdb.module';

@Module({
  imports: [
    ScandexModule,
    IgdbModule
  ],
  providers: [GamesService],
  controllers: [GamesController]
})
export class GamesModule {}
