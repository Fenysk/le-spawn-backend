import { Module } from '@nestjs/common';
import { SwaggerService } from './swagger.service';
import { SwaggerAuthMiddleware } from './swagger.middleware';

@Module({
  providers: [SwaggerService, SwaggerAuthMiddleware],
  exports: [SwaggerService],
})
export class SwaggerModule {}
