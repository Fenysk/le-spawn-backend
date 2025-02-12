import { Controller, Get } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { TwitchAuthResponse } from './interface/twitch-auth.response';

@Controller('twitch')
export class TwitchController {
  constructor(private readonly twitchService: TwitchService) {}

  @Get('token')
  async getAccessToken(): Promise<TwitchAuthResponse> {
    return this.twitchService.getAccessToken();
  }
}
