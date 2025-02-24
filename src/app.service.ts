import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService
  ) { }

  getHealthCheck(): string {
    return 'OK';
  }

  isCurrentVersionGreaterThanRequired(
    currentFrontVersion: string,
  ): boolean {
    const frontVersionRequired = this.configService.get<string>('FRONT_VERSION_REQUIRED');

    if (currentFrontVersion < frontVersionRequired)
      throw new BadRequestException(`Update required to version ${frontVersionRequired}`);

    return true;
  }
}
