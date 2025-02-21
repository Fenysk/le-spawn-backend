import { Body, Controller, Get } from '@nestjs/common';
import { Platform } from '@prisma/client';
import { SearchPlatformsRequest } from '@/bank/dto/search-platforms.request';
import { PlatformsBankService } from '@/bank/platforms/platforms-bank.service';

@Controller('platforms')
export class PlatformsController {
    constructor(
        private readonly platformsBankService: PlatformsBankService
    ) { }

    @Get()
    async searchPlatforms(
        @Body() searchPlatformsDto: SearchPlatformsRequest
    ): Promise<Platform[]> {
        return this.platformsBankService.searchPlatforms(searchPlatformsDto);
    }
}
