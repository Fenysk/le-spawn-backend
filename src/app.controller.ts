import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorator/public.decorator';

@Public()
@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
    ) { }

    @Get()
    getHealthCheck(): string {
        return this.appService.getHealthCheck();
    }

    @Get('check-update/:version')
    checkUpdate(
        @Param('version') version: string,
    ): boolean {
        return this.appService.isCurrentVersionGreaterThanRequired(
            version
        );
    }
}
