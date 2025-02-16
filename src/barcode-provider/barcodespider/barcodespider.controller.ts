import { Controller, Get, Param} from '@nestjs/common';
import { BarcodespiderService } from './barcodespider.service';
import { BarcodespiderApiResponse } from './interfaces/barcodespider-api.response';

@Controller('barcodespider')
export class BarcodespiderController {
  constructor(private readonly barcodespiderService: BarcodespiderService) { }

  @Get('lookup/:barcode')
  async lookup(
    @Param('barcode') barcode: string
  ): Promise<BarcodespiderApiResponse> {
    return this.barcodespiderService.lookup({ barcode });
  }
}
