import { Controller, Get, Param } from '@nestjs/common';
import { IgdbService } from './igdb.service';

@Controller('igdb')
export class IgdbController {
  constructor(private readonly igdbService: IgdbService) { }

  @Get('game/id/:id')
  async getGameById(
    @Param('id') id: number
  ) {
    return await this.igdbService.getGameById(id);
  }

  @Get('game/name/:name')
  async getGameByName(
    @Param('name') name: string
  ) {
    return await this.igdbService.getGamesFromName(name);
  }

  @Get('platform/:id')
  async getPlatformById(
    @Param('id') id: number
  ) {
    return await this.igdbService.getPlatformById(id);
  }
}
