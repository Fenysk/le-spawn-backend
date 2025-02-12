import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { SecurityService } from './security/security.service';

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
