import { Controller, Get, Param } from '@nestjs/common';
import { IgdbService } from './igdb.service';

@Controller('igdb')
export class IgdbController {
  constructor(private readonly igdbService: IgdbService) {}

  @Get(':id')
  getGameById(
    @Param('id') id: number
) {
    return this.igdbService.getGameById(id);
  }
}
