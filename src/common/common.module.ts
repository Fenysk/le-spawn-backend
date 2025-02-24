import { Module } from '@nestjs/common';
import { ApiService } from './services/api.service';
import { SecurityService } from './services/security.service';
import { JsonService } from './services/json.service';

@Module({
  providers: [
    ApiService,
    SecurityService,
    JsonService,
  ],
  exports: [
    ApiService,
    SecurityService,
    JsonService,
  ],
})
export class CommonModule {}
