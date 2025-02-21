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
}); 