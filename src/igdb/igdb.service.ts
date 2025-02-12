import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import igdb from 'igdb-api-node';
import { TwitchService } from 'src/twitch/twitch.service';
import { IGDBGameResponse } from './interface/igdb-game.response';
import { IGDBPlatformResponse } from './interface/igdb-platform.response';

@Injectable()
export class IgdbService implements OnModuleInit {
    private client: any;
    private accessToken: string;
    private tokenExpiration: number;

    constructor(
        private readonly configService: ConfigService,
        private readonly twitchService: TwitchService
    ) { }

    async onModuleInit() {
        await this.initializeClient();
    }

    private async initializeClient() {
        const clientId = this.configService.get<string>('TWITCH_CLIENT_ID');
        const { access_token: accessToken, expires_in: expiresIn } = await this.twitchService.getAccessToken();
        this.accessToken = accessToken;
        this.tokenExpiration = Date.now() + expiresIn * 1000;
        this.client = igdb(clientId, this.accessToken);
    }

    private async ensureValidToken() {
        if (Date.now() >= this.tokenExpiration) {
            await this.initializeClient();
        }
    }

    async getGameById(id: number): Promise<IGDBGameResponse> {
        try {
            await this.ensureValidToken();
            const { data } = await this.client
                .fields([
                    'alternative_names.*',
                    'category', // enum
                    'cover.*',
                    'first_release_date', // unix timestamp
                    'franchise.*',
                    'franchises.*',
                    'genres.*',
                    'keywords.*',
                    'name',
                    'platforms.*',
                    'release_dates.*',
                    'screenshots.*',
                    'slug',
                    'storyline',
                    'summary',
                    'themes.*',
                    'url',
                    'videos.*',
                ])
                .where(`id = ${id}`)
                .request('/games');

            const game = data[0];

            if (!game)
                throw new NotFoundException('Game not found in IGDB');

            return game;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getPlatformById(id: number): Promise<IGDBPlatformResponse> {
        try {
            await this.ensureValidToken();
            const { data } = await this.client
                .fields(['*'])
                .where(`id = ${id}`)
                .request('/platforms');
    
            const platform = data[0];
    
            if (!platform)
                throw new NotFoundException('Platform not found in IGDB');
    
            return platform;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    getGameCoverFullUrl(coverUrl: string): string {
        return coverUrl.replace(/^(https?:)?\/\//, 'https://').replace('t_thumb', 't_cover_big_2x');
    }

    getScreenshotFullUrl(screenshotUrl: string): string {
        return screenshotUrl.replace(/^(https?:)?\/\//, 'https://').replace('t_thumb', 't_screenshot_huge');
    }
}
