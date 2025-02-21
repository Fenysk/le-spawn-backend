import { Module } from '@nestjs/common';
import { ApiService } from './services/api.service';
import { SecurityService } from './services/security.service';

@Module({
  providers: [
    ApiService,
    SecurityService,
  ],
  exports: [
    ApiService,
    SecurityService,
  ],
})
export class CommonModule {}
