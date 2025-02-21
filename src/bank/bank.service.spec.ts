import { Test, TestingModule } from '@nestjs/testing';
import { BankService } from './bank.service';
import { GamesBankService } from './games/games-bank.service';
import { ScandexService } from '@/barcode-provider/scandex/scandex.service';
import { IgdbService } from '@/igdb/igdb.service';
import { PlatformsBankService } from './platforms/platforms-bank.service';
import { UpcitemdbService } from '@/barcode-provider/upcitemdb/upcitemdb.service';
import { PricechartingService } from '@/barcode-provider/pricecharting/pricecharting.service';
import { BarcodespiderService } from '@/barcode-provider/barcodespider/barcodespider.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { IGDBGameResponse } from '@/igdb/interface/igdb-game.response';
import { PricechartingApiResponse } from '@/barcode-provider/pricecharting/interface/pricecharting-api.response';
import { UpcitemdbLookupResponse } from '@/barcode-provider/upcitemdb/interface/upcitemdb-lookup.response';
import { BarcodespiderApiResponse } from '@/barcode-provider/barcodespider/interfaces/barcodespider-api.response';
import { Game, GameCategoryEnum } from '@prisma/client';

// Mock des enums et services
jest.mock('@/igdb/enum/game-category.enum', () => ({
  getGameCategoryEnum: jest.fn().mockReturnValue(0), // MAIN_GAME
}));

jest.mock('@/prisma/prisma.service');

describe('BankService', () => {
  let service: BankService;
  let gamesBankService: jest.Mocked<GamesBankService>;
  let scandexService: jest.Mocked<ScandexService>;
  let igdbService: jest.Mocked<IgdbService>;
  let platformsBankService: jest.Mocked<PlatformsBankService>;
  let upcitemdbService: jest.Mocked<UpcitemdbService>;
  let pricechartingService: jest.Mocked<PricechartingService>;
  let barcodespiderService: jest.Mocked<BarcodespiderService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankService,
        {
          provide: GamesBankService,
          useValue: {
            searchGamesInBank: jest.fn(),
            addGameToBank: jest.fn(),
          },
        },
        {
          provide: ScandexService,
          useValue: {
            lookup: jest.fn(),
          },
        },
        {
          provide: IgdbService,
          useValue: {
            getGamesFromName: jest.fn(),
            getGameById: jest.fn(),
            getGameCoverFullUrl: jest.fn(),
            getScreenshotFullUrl: jest.fn(),
            getPlatformById: jest.fn(),
          },
        },
        {
          provide: PlatformsBankService,
          useValue: {
            getPlatformWithIgdbId: jest.fn(),
            addPlatformToBank: jest.fn(),
          },
        },
        {
          provide: UpcitemdbService,
          useValue: {
            lookup: jest.fn(),
          },
        },
        {
          provide: PricechartingService,
          useValue: {
            lookup: jest.fn(),
          },
        },
        {
          provide: BarcodespiderService,
          useValue: {
            lookup: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            game: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BankService>(BankService);
    gamesBankService = module.get(GamesBankService);
    scandexService = module.get(ScandexService);
    igdbService = module.get(IgdbService);
    platformsBankService = module.get(PlatformsBankService);
    upcitemdbService = module.get(UpcitemdbService);
    pricechartingService = module.get(PricechartingService);
    barcodespiderService = module.get(BarcodespiderService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fromUnixTimestamp', () => {
    it('should convert unix timestamp to Date object', () => {
      const timestamp = 1740137435; // 21 February 2025 12:30:35
      
      // @ts-ignore - accessing private method for testing
      const result = service['fromUnixTimestamp'](timestamp);
      
      // Vérifie que la date correspond exactement à ce qu'on attend
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(1); // 0-based, donc 1 = février
      expect(result.getDate()).toBe(21);
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(35);
    });
  });

  describe('checkOtherPossibilities', () => {
    const mockGame: IGDBGameResponse = {
      id: 1,
      name: 'Test Game',
      alternative_names: [],
      category: 0,
      cover: null,
      first_release_date: 1740137435,
      franchises: [],
      genres: [],
      platforms: [],
      screenshots: [],
      storyline: '',
      summary: '',
      release_dates: [],
      slug: 'test-game',
      themes: [],
      url: 'https://www.igdb.com/games/test-game',
      videos: []
    };

    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();
    });

    it('should return games when found with full product name', async () => {
      const productName = 'Super Mario Bros Wonder';
      const expectedGames = [mockGame];
      
      igdbService.getGamesFromName.mockResolvedValueOnce(expectedGames);

      // @ts-ignore - accessing private method for testing
      const result = await service['checkOtherPossibilities'](productName);

      expect(igdbService.getGamesFromName).toHaveBeenCalledWith(productName);
      expect(result).toEqual(expectedGames);
      expect(igdbService.getGamesFromName).toHaveBeenCalledTimes(1);
    });

    it('should try with fewer words when full name returns no results', async () => {
      const productName = 'Super Mario Bros Wonder Nintendo Switch';
      
      // Mock first call with full name returns empty array
      igdbService.getGamesFromName
        .mockResolvedValueOnce([]) // "Super Mario Bros Wonder Nintendo Switch"
        .mockResolvedValueOnce([]) // "Super Mario Bros Wonder Nintendo"
        .mockResolvedValueOnce([mockGame]); // "Super Mario Bros Wonder"

      // @ts-ignore - accessing private method for testing
      const result = await service['checkOtherPossibilities'](productName);

      expect(igdbService.getGamesFromName).toHaveBeenCalledTimes(3);
      expect(igdbService.getGamesFromName).toHaveBeenNthCalledWith(1, 'Super Mario Bros Wonder Nintendo Switch');
      expect(igdbService.getGamesFromName).toHaveBeenNthCalledWith(2, 'Super Mario Bros Wonder Nintendo');
      expect(igdbService.getGamesFromName).toHaveBeenNthCalledWith(3, 'Super Mario Bros Wonder');
      expect(result).toEqual([mockGame]);
    });

    it('should handle 404 errors from IGDB and continue searching', async () => {
      const productName = 'Super Mario Bros Wonder';
      const notFoundError = { response: { statusCode: 404 } };
      
      igdbService.getGamesFromName
        .mockRejectedValueOnce(notFoundError)
        .mockResolvedValueOnce([mockGame]);

      // @ts-ignore - accessing private method for testing
      const result = await service['checkOtherPossibilities'](productName);

      expect(igdbService.getGamesFromName).toHaveBeenCalledTimes(2);
      expect(result).toEqual([mockGame]);
    });

    it('should throw non-404 errors', async () => {
      const productName = 'Super Mario Bros Wonder';
      const serverError = new Error('Internal Server Error');
      
      igdbService.getGamesFromName.mockRejectedValueOnce(serverError);

      // @ts-ignore - accessing private method for testing
      await expect(service['checkOtherPossibilities'](productName))
        .rejects
        .toThrow(serverError);
      
      expect(igdbService.getGamesFromName).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no games are found with any combination', async () => {
      const productName = 'Some Unknown Game Title';
      
      // Mock all calls to return empty arrays
      igdbService.getGamesFromName.mockResolvedValue([]);

      // @ts-ignore - accessing private method for testing
      const result = await service['checkOtherPossibilities'](productName);

      expect(result).toEqual([]);
      // Should have been called for each word combination
      expect(igdbService.getGamesFromName).toHaveBeenCalledTimes(4);
    });
  });

  describe('getGamesFromBarcode', () => {
    const mockGame: IGDBGameResponse = {
      id: 1,
      name: 'Test Game',
      alternative_names: [],
      category: 0,
      cover: null,
      first_release_date: 1740137435,
      franchises: [],
      genres: [],
      platforms: [],
      screenshots: [],
      storyline: '',
      summary: '',
      release_dates: [],
      slug: 'test-game',
      themes: [],
      url: 'https://www.igdb.com/games/test-game',
      videos: []
    };

    const mockPrismaGame = {
      id: '1',
      name: 'Test Game',
      igdbGameId: 1,
      barcodes: ['123456789'],
      category: 'mainGame' as GameCategoryEnum,
      firstReleaseDate: new Date('2025-02-21'),
      coverUrl: '',
      summary: '',
      storyline: '',
      franchises: [],
      genres: [],
      screenshotsUrl: [],
      platformsRelation: [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as Game;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return games from database if found', async () => {
      const barcode = '123456789';
      gamesBankService.searchGamesInBank.mockResolvedValueOnce([mockPrismaGame]);

      const result = await service.getGamesFromBarcode(barcode);

      expect(result).toEqual([mockPrismaGame]);
      expect(gamesBankService.searchGamesInBank).toHaveBeenCalledWith({ barcode });
      expect(pricechartingService.lookup).not.toHaveBeenCalled();
      expect(upcitemdbService.lookup).not.toHaveBeenCalled();
      expect(scandexService.lookup).not.toHaveBeenCalled();
      expect(barcodespiderService.lookup).not.toHaveBeenCalled();
    });

    it('should try PriceCharting first when game not in database', async () => {
      const barcode = '123456789';
      gamesBankService.searchGamesInBank.mockRejectedValueOnce(new NotFoundException());
      pricechartingService.lookup.mockResolvedValueOnce({
        status: 'success',
        'product-name': 'Test Game',
        'console-name': 'Nintendo Switch',
        id: '123'
      } as PricechartingApiResponse);
      igdbService.getGamesFromName.mockResolvedValueOnce([mockGame]);
      gamesBankService.addGameToBank.mockResolvedValueOnce(mockPrismaGame);

      const result = await service.getGamesFromBarcode(barcode);

      expect(gamesBankService.searchGamesInBank).toHaveBeenCalledWith({ barcode });
      expect(pricechartingService.lookup).toHaveBeenCalledWith({ barcode });
      expect(upcitemdbService.lookup).not.toHaveBeenCalled();
      expect(scandexService.lookup).not.toHaveBeenCalled();
      expect(barcodespiderService.lookup).not.toHaveBeenCalled();
      expect(result).toEqual([mockPrismaGame]);
    });

    it('should try UPCItemDB when PriceCharting fails', async () => {
      const barcode = '123456789';
      gamesBankService.searchGamesInBank.mockRejectedValueOnce(new NotFoundException());
      pricechartingService.lookup.mockRejectedValueOnce(new Error());
      upcitemdbService.lookup.mockResolvedValueOnce({
        code: 'OK',
        total: 1,
        offset: 0,
        items: [{
          ean: '123456789',
          title: 'Test Game',
          upc: '123456789',
          description: 'Test Game Description',
          brand: 'Nintendo',
          model: 'Switch',
          dimension: '10x10x10',
          weight: '100g',
          category: 'Video Games',
          currency: 'USD',
          lowest_recorded_price: 49.99,
          highest_recorded_price: 59.99,
          images: ['image1.jpg'],
          offers: []
        }]
      } as UpcitemdbLookupResponse);
      igdbService.getGamesFromName.mockResolvedValueOnce([mockGame]);
      gamesBankService.addGameToBank.mockResolvedValueOnce(mockPrismaGame);

      const result = await service.getGamesFromBarcode(barcode);

      expect(pricechartingService.lookup).toHaveBeenCalledWith({ barcode });
      expect(upcitemdbService.lookup).toHaveBeenCalledWith({ barcode: Number(barcode) });
      expect(scandexService.lookup).not.toHaveBeenCalled();
      expect(barcodespiderService.lookup).not.toHaveBeenCalled();
      expect(result).toEqual([mockPrismaGame]);
    });

    it('should try Scandex when UPCItemDB fails', async () => {
      const barcode = '123456789';
      gamesBankService.searchGamesInBank.mockRejectedValueOnce(new NotFoundException());
      pricechartingService.lookup.mockRejectedValueOnce(new Error());
      upcitemdbService.lookup.mockRejectedValueOnce(new Error());
      scandexService.lookup.mockResolvedValueOnce({
        igdb_metadata: {
          id: 1,
          name: 'Test Game',
          platform: {
            id: 1,
            name: 'Nintendo Switch'
          }
        }
      });
      igdbService.getGameById.mockResolvedValueOnce([mockGame]);
      gamesBankService.addGameToBank.mockResolvedValueOnce(mockPrismaGame);

      const result = await service.getGamesFromBarcode(barcode);

      expect(scandexService.lookup).toHaveBeenCalledWith({ barcode });
      expect(barcodespiderService.lookup).not.toHaveBeenCalled();
      expect(result).toEqual([mockPrismaGame]);
    });

    it('should try Barcodespider as last resort', async () => {
      const barcode = '123456789';
      gamesBankService.searchGamesInBank.mockRejectedValueOnce(new NotFoundException());
      pricechartingService.lookup.mockRejectedValueOnce(new Error());
      upcitemdbService.lookup.mockRejectedValueOnce(new Error());
      scandexService.lookup.mockRejectedValueOnce(new Error());
      barcodespiderService.lookup.mockResolvedValueOnce({
        item_response: {
          code: 200,
          status: 'success',
          message: 'OK'
        },
        item_attributes: {
          title: 'Test Game',
          upc: '123456789',
          ean: '123456789',
          parent_category: 'Video Games',
          category: 'Games',
          brand: 'Nintendo',
          model: 'Switch',
          mpn: '',
          manufacturer: 'Nintendo',
          publisher: 'Nintendo',
          asin: '',
          color: '',
          size: '',
          weight: '',
          image: 'image1.jpg',
          is_adult: 'false',
          description: 'Test Game Description',
          lowest_price: '49.99',
          highest_price: '59.99'
        },
        Stores: []
      } as BarcodespiderApiResponse);
      igdbService.getGamesFromName.mockResolvedValueOnce([mockGame]);
      gamesBankService.addGameToBank.mockResolvedValueOnce(mockPrismaGame);

      const result = await service.getGamesFromBarcode(barcode);

      expect(barcodespiderService.lookup).toHaveBeenCalledWith({ barcode });
      expect(result).toEqual([mockPrismaGame]);
    });

    it('should throw NotFoundException when no games found in any service', async () => {
      const barcode = '123456789';
      gamesBankService.searchGamesInBank.mockRejectedValueOnce(new NotFoundException());
      pricechartingService.lookup.mockRejectedValueOnce(new Error());
      upcitemdbService.lookup.mockRejectedValueOnce(new Error());
      scandexService.lookup.mockRejectedValueOnce(new Error());
      barcodespiderService.lookup.mockRejectedValueOnce(new Error());

      await expect(service.getGamesFromBarcode(barcode))
        .rejects
        .toThrow(NotFoundException);

      expect(gamesBankService.addGameToBank).not.toHaveBeenCalled();
    });
  });

  describe('addNewGameFromIgdbGames', () => {
    const mockIgdbGame: IGDBGameResponse = {
      id: 1,
      name: 'Test Game',
      alternative_names: [],
      category: 0,
      cover: {
        id: 1,
        url: '/test-cover.jpg',
        alpha_channel: false,
        animated: false,
        game: 1,
        height: 800,
        width: 600,
        image_id: 'test-cover',
        checksum: 'test-checksum'
      },
      first_release_date: 1740137435,
      franchises: [
        {
          id: 1,
          name: 'Test Franchise',
          created_at: 1740137435,
          games: [1],
          slug: 'test-franchise',
          updated_at: 1740137435,
          url: 'https://www.igdb.com/franchises/test-franchise',
          checksum: 'test-checksum'
        }
      ],
      genres: [
        {
          id: 1,
          name: 'RPG',
          created_at: 1740137435,
          slug: 'rpg',
          updated_at: 1740137435,
          url: 'https://www.igdb.com/genres/rpg',
          checksum: 'test-checksum'
        }
      ],
      platforms: [
        {
          id: 1,
          name: 'Nintendo Switch',
          abbreviation: 'NSW',
          category: 1,
          created_at: 1740137435,
          generation: 8,
          platform_logo: 1,
          platform_family: 1,
          slug: 'switch',
          updated_at: 1740137435,
          url: 'https://www.igdb.com/platforms/switch',
          versions: [],
          websites: [],
          checksum: 'test-checksum'
        }
      ],
      screenshots: [
        {
          id: 1,
          url: '/screenshot1.jpg',
          alpha_channel: false,
          animated: false,
          game: 1,
          height: 1080,
          width: 1920,
          image_id: 'screenshot1',
          checksum: 'test-checksum'
        },
        {
          id: 2,
          url: '/screenshot2.jpg',
          alpha_channel: false,
          animated: false,
          game: 1,
          height: 1080,
          width: 1920,
          image_id: 'screenshot2',
          checksum: 'test-checksum'
        }
      ],
      storyline: 'Test storyline',
      summary: 'Test summary',
      release_dates: [],
      slug: 'test-game',
      themes: [],
      url: 'https://www.igdb.com/games/test-game',
      videos: []
    };

    const mockPlatform = {
      id: 'platform-1',
      name: 'Nintendo Switch',
      igdbPlatformId: 1,
      abbreviation: 'NSW',
      generation: 8
    };

    const mockPrismaGame = {
      id: '1',
      name: 'Test Game',
      igdbGameId: 1,
      barcodes: [],
      category: 'mainGame' as GameCategoryEnum,
      firstReleaseDate: new Date('2025-02-21'),
      coverUrl: 'https://images.igdb.com/test-cover.jpg',
      summary: 'Test summary',
      storyline: 'Test storyline',
      franchises: ['Test Franchise'],
      genres: ['RPG'],
      screenshotsUrl: [
        'https://images.igdb.com/screenshot1.jpg',
        'https://images.igdb.com/screenshot2.jpg'
      ],
      platformsRelation: [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as Game;

    beforeEach(() => {
      jest.clearAllMocks();
      igdbService.getGameCoverFullUrl.mockImplementation(url => `https://images.igdb.com${url}`);
      igdbService.getScreenshotFullUrl.mockImplementation(url => `https://images.igdb.com${url}`);
      igdbService.getPlatformById = jest.fn();
    });

    it('should add a single game to bank', async () => {
      const igdbGames = [mockIgdbGame];
      const expectedDate = new Date('2025-02-21T11:30:35.000Z');
      
      platformsBankService.getPlatformWithIgdbId.mockResolvedValueOnce(mockPlatform);
      gamesBankService.addGameToBank.mockResolvedValueOnce(mockPrismaGame);

      const result = await service.addNewGameFromIgdbGames(igdbGames);

      expect(platformsBankService.getPlatformWithIgdbId).toHaveBeenCalledWith(1);
      expect(gamesBankService.addGameToBank).toHaveBeenCalledWith({
        igdbGameId: mockIgdbGame.id,
        barcodes: [],
        category: mockIgdbGame.category,
        coverUrl: 'https://images.igdb.com/test-cover.jpg',
        firstReleaseDate: expectedDate,
        franchises: ['Test Franchise'],
        genres: ['RPG'],
        name: mockIgdbGame.name,
        screenshotsUrl: [
          'https://images.igdb.com/screenshot1.jpg',
          'https://images.igdb.com/screenshot2.jpg'
        ],
        storyline: mockIgdbGame.storyline,
        summary: mockIgdbGame.summary,
        platformIds: [mockPlatform.id]
      });
      expect(result).toEqual([mockPrismaGame]);
    });

    it('should handle games without optional fields', async () => {
      const minimalIgdbGame: IGDBGameResponse = {
        id: 1,
        name: 'Test Game',
        alternative_names: [],
        category: 0,
        cover: null,
        first_release_date: null,
        franchises: [],
        genres: [],
        platforms: [],
        screenshots: [],
        storyline: '',
        summary: '',
        release_dates: [],
        slug: 'test-game',
        themes: [],
        url: 'https://www.igdb.com/games/test-game',
        videos: []
      };

      const minimalPrismaGame = {
        ...mockPrismaGame,
        coverUrl: undefined,
        firstReleaseDate: null,
        franchises: [],
        genres: [],
        screenshotsUrl: [],
        storyline: '',
        summary: ''
      };

      gamesBankService.addGameToBank.mockResolvedValueOnce(minimalPrismaGame);

      const result = await service.addNewGameFromIgdbGames([minimalIgdbGame]);

      expect(gamesBankService.addGameToBank).toHaveBeenCalledWith({
        igdbGameId: minimalIgdbGame.id,
        barcodes: [],
        category: minimalIgdbGame.category,
        coverUrl: undefined,
        firstReleaseDate: null,
        franchises: [],
        genres: [],
        name: minimalIgdbGame.name,
        screenshotsUrl: [],
        storyline: minimalIgdbGame.storyline,
        summary: minimalIgdbGame.summary,
        platformIds: []
      });
      expect(result).toEqual([minimalPrismaGame]);
    });

    it('should handle multiple games', async () => {
      const igdbGames = [mockIgdbGame, { ...mockIgdbGame, id: 2, name: 'Test Game 2' }];
      
      platformsBankService.getPlatformWithIgdbId.mockResolvedValue(mockPlatform);
      gamesBankService.addGameToBank
        .mockResolvedValueOnce(mockPrismaGame)
        .mockResolvedValueOnce({ ...mockPrismaGame, id: '2', name: 'Test Game 2' });

      const result = await service.addNewGameFromIgdbGames(igdbGames);

      expect(platformsBankService.getPlatformWithIgdbId).toHaveBeenCalledTimes(2);
      expect(gamesBankService.addGameToBank).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Test Game');
      expect(result[1].name).toBe('Test Game 2');
    });

    it('should handle platform not found', async () => {
      const igdbGames = [mockIgdbGame];
      
      platformsBankService.getPlatformWithIgdbId.mockRejectedValueOnce(new NotFoundException());
      igdbService.getPlatformById.mockResolvedValueOnce({
        id: 1,
        name: 'Nintendo Switch',
        abbreviation: 'NSW',
        category: 1,
        created_at: 1740137435,
        generation: 8,
        platform_logo: 1,
        platform_family: 1,
        slug: 'switch',
        updated_at: 1740137435,
        url: 'https://www.igdb.com/platforms/switch',
        versions: [],
        websites: [],
        checksum: 'test-checksum'
      });
      platformsBankService.addPlatformToBank.mockResolvedValueOnce(mockPlatform);
      gamesBankService.addGameToBank.mockResolvedValueOnce(mockPrismaGame);

      const result = await service.addNewGameFromIgdbGames(igdbGames);

      expect(platformsBankService.getPlatformWithIgdbId).toHaveBeenCalledWith(1);
      expect(platformsBankService.addPlatformToBank).toHaveBeenCalledWith({
        igdbPlatformId: 1,
        name: 'Nintendo Switch',
        abbreviation: 'NSW',
        generation: 8
      });
      expect(result).toEqual([mockPrismaGame]);
    });

    it('should handle empty array of games', async () => {
      const result = await service.addNewGameFromIgdbGames([]);

      expect(platformsBankService.getPlatformWithIgdbId).not.toHaveBeenCalled();
      expect(gamesBankService.addGameToBank).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
}); 