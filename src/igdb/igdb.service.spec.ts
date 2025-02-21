import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { IgdbService } from './igdb.service';
import { TwitchService } from '@/twitch/twitch.service';
import { NotFoundException } from '@nestjs/common';

describe('IgdbService', () => {
  let igdbService: IgdbService;
  let twitchService: TwitchService;

  const mockTwitchService = {
    getAccessToken: jest.fn().mockResolvedValue({
      access_token: 'mock-token',
      expires_in: 3600
    })
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-client-id')
  };

  const mockIgdbClient = {
    fields: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    search: jest.fn().mockReturnThis(),
    request: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IgdbService,
        { provide: TwitchService, useValue: mockTwitchService },
        { provide: ConfigService, useValue: mockConfigService }
      ],
    }).compile();

    igdbService = module.get<IgdbService>(IgdbService);
    twitchService = module.get<TwitchService>(TwitchService);
    // @ts-ignore: Mock client
    igdbService['client'] = mockIgdbClient;
  });

  it('should be defined', () => {
    expect(igdbService).toBeDefined();
  });

  describe('getGameById', () => {
    it('should return a game when found', async () => {
      const mockGame = { id: 1, name: 'Test Game' };
      mockIgdbClient.request.mockResolvedValueOnce({ data: [mockGame] });

      const result = await igdbService.getGameById(1);

      expect(result).toEqual([mockGame]);
      expect(mockIgdbClient.fields).toHaveBeenCalled();
      expect(mockIgdbClient.where).toHaveBeenCalledWith('id = 1');
      expect(mockIgdbClient.request).toHaveBeenCalledWith('/games');
    });

    it('should throw NotFoundException when game not found', async () => {
      mockIgdbClient.request.mockResolvedValueOnce({ data: [] });

      await expect(igdbService.getGameById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGamesFromName', () => {
    it('should return games when found', async () => {
      const mockGames = [
        { id: 1, name: 'Test Game 1' },
        { id: 2, name: 'Test Game 2' }
      ];
      mockIgdbClient.request.mockResolvedValueOnce({ data: mockGames });

      const result = await igdbService.getGamesFromName('Test');

      expect(result).toEqual(mockGames);
      expect(mockIgdbClient.fields).toHaveBeenCalled();
      expect(mockIgdbClient.search).toHaveBeenCalledWith('Test');
      expect(mockIgdbClient.request).toHaveBeenCalledWith('/games');
    });

    it('should throw NotFoundException when no games found', async () => {
      mockIgdbClient.request.mockResolvedValueOnce({ data: [] });

      await expect(igdbService.getGamesFromName('NonExistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('image URL methods', () => {
    it('should format game cover URL correctly', () => {
      const result = igdbService.getGameCoverFullUrl('//images.igdb.com/igdb/image/upload/t_thumb/co977f.webp');
      expect(result).toBe('https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co977f.webp');
    });

    it('should format screenshot URL correctly', () => {
      const result = igdbService.getScreenshotFullUrl('//images.igdb.com/igdb/image/upload/t_thumb/ikwlxqifer4rr80tphz4.webp');
      expect(result).toBe('https://images.igdb.com/igdb/image/upload/t_screenshot_huge/ikwlxqifer4rr80tphz4.webp');
    });

    it('should return empty string for undefined URLs', () => {
      expect(igdbService.getGameCoverFullUrl(undefined)).toBe('');
      expect(igdbService.getScreenshotFullUrl(undefined)).toBe('');
    });
  });
}); 