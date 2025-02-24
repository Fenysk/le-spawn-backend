import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService
  ) {}

  getHealthCheck(): string {
    return 'OK';
  }

  isCurrentVersionGreaterThanRequired(
    currentFrontVersion: string,
  ): boolean {
    const frontVersionRequired = this.configService.get('FRONT_VERSION_REQUIRED');
    return currentFrontVersion >= frontVersionRequired;
  }
}
