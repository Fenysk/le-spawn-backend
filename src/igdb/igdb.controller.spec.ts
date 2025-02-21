import { Test, TestingModule } from '@nestjs/testing';
import { IgdbController } from './igdb.controller';
import { IgdbService } from './igdb.service';
import { NotFoundException } from '@nestjs/common';

describe('IgdbController', () => {
  let controller: IgdbController;
  let service: IgdbService;

  const mockIgdbService = {
    getGameById: jest.fn(),
    getGamesFromName: jest.fn(),
    getPlatformById: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IgdbController],
      providers: [
        { provide: IgdbService, useValue: mockIgdbService }
      ],
    }).compile();

    controller = module.get<IgdbController>(IgdbController);
    service = module.get<IgdbService>(IgdbService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGameById', () => {
    it('should return game data', async () => {
      const mockGame = { id: 1, name: 'Test Game' };
      mockIgdbService.getGameById.mockResolvedValueOnce([mockGame]);

      const result = await controller.getGameById(1);

      expect(result).toEqual([mockGame]);
      expect(service.getGameById).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when id is not a number', async () => {
      const invalidId = 'abc';
      await expect(controller.getGameById(invalidId as unknown as number)).rejects.toThrow();
    });

    it('should throw NotFoundException when game is not found', async () => {
      mockIgdbService.getGameById.mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getGameById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGameByName', () => {
    it('should return games data', async () => {
      const mockGames = [
        { id: 1, name: 'Test Game 1' },
        { id: 2, name: 'Test Game 2' }
      ];
      mockIgdbService.getGamesFromName.mockResolvedValueOnce(mockGames);

      const result = await controller.getGameByName('Test');

      expect(result).toEqual(mockGames);
      expect(service.getGamesFromName).toHaveBeenCalledWith('Test');
    });

    it('should throw BadRequestException when name is empty', async () => {
      await expect(controller.getGameByName('')).rejects.toThrow();
    });

    it('should throw NotFoundException when no games are found', async () => {
      mockIgdbService.getGamesFromName.mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getGameByName('NonExistentGame')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPlatformById', () => {
    it('should return platform data', async () => {
      const mockPlatform = { id: 1, name: 'Test Platform' };
      mockIgdbService.getPlatformById.mockResolvedValueOnce(mockPlatform);

      const result = await controller.getPlatformById(1);

      expect(result).toEqual(mockPlatform);
      expect(service.getPlatformById).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when id is not a number', async () => {
      const invalidId = 'abc';
      await expect(controller.getPlatformById(invalidId as unknown as number)).rejects.toThrow();
    });

    it('should throw NotFoundException when platform is not found', async () => {
      mockIgdbService.getPlatformById.mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getPlatformById(999)).rejects.toThrow(NotFoundException);
    });
  });
}); 