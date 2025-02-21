import { Controller, Get, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { IgdbService } from './igdb.service';

@Controller('igdb')
export class IgdbController {
  constructor(private readonly igdbService: IgdbService) { }

  @Get('game/id/:id')
  async getGameById(
    @Param('id') id: number
  ): Promise<any> {
    if (isNaN(id) || !Number.isInteger(Number(id))) 
      throw new BadRequestException('Invalid game ID');

    return this.igdbService.getGameById(id);
  }

  @Get('game/name/:name')
  async getGameByName(
    @Param('name') name: string
  ): Promise<any> {
    if (!name || name.trim().length === 0)
      throw new BadRequestException('Game name cannot be empty');

    return this.igdbService.getGamesFromName(name);
  }

  @Get('platform/:id')
  async getPlatformById(
    @Param('id') id: number
  ): Promise<any> {
    if (isNaN(id) || !Number.isInteger(Number(id)))
      throw new BadRequestException('Invalid platform ID');
    
    return this.igdbService.getPlatformById(id);
  }
}
