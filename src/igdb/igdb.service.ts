import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import igdb from 'igdb-api-node';
import { TwitchService } from '@/twitch/twitch.service';
import { IGDBGameResponse } from './interface/igdb-game.response';
import { IGDBPlatformResponse } from './interface/igdb-platform.response';
import { GAME_FIELDS, GAME_LOCALIZATION_FIELDS, PLATFORM_FIELDS } from './constants/igdb-fields.constant';
import { IGDBGameLocalizationResponse } from './interface/igdb-game-localization.response';

@Injectable()
export class IgdbService implements OnModuleInit {
    private readonly logger = new Logger(IgdbService.name);
    private client: any;
    private accessToken: string;
    private tokenExpiration: number;

    private readonly IMAGE_BASE_URL = 'https://';
    private readonly COVER_SIZE = 't_cover_big_2x';
    private readonly SCREENSHOT_SIZE = 't_screenshot_huge';

    constructor(
        private readonly configService: ConfigService,
        private readonly twitchService: TwitchService
    ) { }

    async onModuleInit(): Promise<void> {
        await this.initializeClient();
    }

    private async initializeClient(): Promise<void> {
        try {
            const clientId = this.configService.get<string>('TWITCH_CLIENT_ID');

            if (!clientId)
                throw new Error('TWITCH_CLIENT_ID not configured');

            const { access_token: accessToken, expires_in: expiresIn } = await this.twitchService.getAccessToken();
            this.accessToken = accessToken;
            this.tokenExpiration = Date.now() + expiresIn * 1000;
            this.client = igdb(clientId, this.accessToken);
        } catch (error) {
            this.logger.error('Failed to initialize IGDB client', error);
            throw error;
        }
    }

    private async ensureValidToken(): Promise<void> {
        if (Date.now() >= this.tokenExpiration) {
            await this.initializeClient();
        }
    }

    async getGameById(id: number): Promise<IGDBGameResponse[]> {
        try {
            await this.ensureValidToken();
            const { data } = await this.client
                .fields(GAME_FIELDS)
                .where(`id = ${id}`)
                .request('/games');

            if (!data.length)
                throw new NotFoundException(`Game with ID ${id} not found in IGDB`);

            return data;
        } catch (error) {
            this.logger.error(`Failed to fetch game with ID ${id}`, error);
            throw error;
        }
    }

    async getGamesFromName(name: string): Promise<IGDBGameResponse[]> {
        try {
            await this.ensureValidToken();
            const { data } = await this.client
                .fields(GAME_FIELDS)
                .search(name)
                .request('/games');

            if (!data.length)
                throw new NotFoundException(`No games found with name "${name}" in IGDB`);

            return data;
        } catch (error) {
            this.logger.error(`Failed to search games with name "${name}"`, error);
            throw error;
        }
    }

    async getPlatformById(id: number): Promise<IGDBPlatformResponse> {
        try {
            await this.ensureValidToken();
            const { data } = await this.client
                .fields(PLATFORM_FIELDS)
                .where(`id = ${id}`)
                .request('/platforms');

            if (!data.length)
                throw new NotFoundException(`Platform with ID ${id} not found in IGDB`);

            return data[0];
        } catch (error) {
            this.logger.error(`Failed to fetch platform with ID ${id}`, error);
            throw error;
        }
    }

    async getGameLocalizations(id: number): Promise<IGDBGameLocalizationResponse[]> {
        try {
            await this.ensureValidToken();
            const { data } = await this.client
                .fields(GAME_LOCALIZATION_FIELDS)
                .where(`id = ${id}`)
                .request('/game_localizations');

            if (!data.length)
                throw new NotFoundException(`Game localization with id ${id} not found in IGDB`);

            return data;
        } catch (error) {
            this.logger.error(`Failed to fetch game localization with id ${id}`, error);
            throw error;
        }
    }

    public getGameCoverFullUrl(coverUrl: string | undefined): string {
        if (!coverUrl) return '';
        return coverUrl
            .replace(/^(https?:)?\/\//, this.IMAGE_BASE_URL)
            .replace('t_thumb', this.COVER_SIZE);
    }

    public getScreenshotFullUrl(screenshotUrl: string | undefined): string {
        if (!screenshotUrl) return '';
        return screenshotUrl
            .replace(/^(https?:)?\/\//, this.IMAGE_BASE_URL)
            .replace('t_thumb', this.SCREENSHOT_SIZE);
    }
}
