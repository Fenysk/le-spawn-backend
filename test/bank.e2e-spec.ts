import { AppModule } from '@/app.module';
import { BarcodespiderService } from '@/barcode-provider/barcodespider/barcodespider.service';
import { PricechartingService } from '@/barcode-provider/pricecharting/pricecharting.service';
import { ScandexService } from '@/barcode-provider/scandex/scandex.service';
import { UpcitemdbService } from '@/barcode-provider/upcitemdb/upcitemdb.service';
import { IgdbService } from '@/igdb/igdb.service';
import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameCategoryEnum } from '@prisma/client';
import * as request from 'supertest';
import { NotFoundException } from '@nestjs/common';

jest.mock('@/igdb/igdb.service');
jest.mock('@/barcode-provider/scandex/scandex.service');
jest.mock('@/barcode-provider/upcitemdb/upcitemdb.service');
jest.mock('@/barcode-provider/pricecharting/pricecharting.service');
jest.mock('@/barcode-provider/barcodespider/barcodespider.service');

describe('BankController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let igdbService: jest.Mocked<IgdbService>;
  let scandexService: jest.Mocked<ScandexService>;
  let upcitemdbService: jest.Mocked<UpcitemdbService>;
  let pricechartingService: jest.Mocked<PricechartingService>;
  let barcodespiderService: jest.Mocked<BarcodespiderService>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(IgdbService)
      .useValue({
        getGamesFromName: jest.fn(),
        getGameById: jest.fn(),
        getPlatformById: jest.fn(),
      })
      .overrideProvider(ScandexService)
      .useValue({
        lookup: jest.fn(),
      })
      .overrideProvider(UpcitemdbService)
      .useValue({
        lookup: jest.fn(),
      })
      .overrideProvider(PricechartingService)
      .useValue({
        lookup: jest.fn(),
      })
      .overrideProvider(BarcodespiderService)
      .useValue({
        lookup: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    igdbService = moduleFixture.get(IgdbService);
    scandexService = moduleFixture.get(ScandexService);
    upcitemdbService = moduleFixture.get(UpcitemdbService);
    pricechartingService = moduleFixture.get(PricechartingService);
    barcodespiderService = moduleFixture.get(BarcodespiderService);

    await app.init();
  });

  afterEach(async () => {
    // Clean up the test database
    await prismaService.gameCollectionItem.deleteMany();
    await prismaService.game.deleteMany();
    await app.close();
  });

  describe('GET /bank/games/barcode/:barcode', () => {
    it('should return 404 when game is not found', async () => {
      const barcode = '0123456789';
      // Mock searchGamesInBank to throw NotFoundException
      jest.spyOn(prismaService.game, 'findMany').mockRejectedValueOnce(new Error('No games found'));
      // Mock all barcode services to return empty arrays
      pricechartingService.lookup.mockRejectedValueOnce(new Error());
      upcitemdbService.lookup.mockRejectedValueOnce(new Error());
      scandexService.lookup.mockRejectedValueOnce(new Error());
      barcodespiderService.lookup.mockRejectedValueOnce(new Error());
      // Mock IGDB service to return empty arrays
      igdbService.getGamesFromName.mockRejectedValueOnce(new NotFoundException('No games found'));

      await request(app.getHttpServer())
        .get(`/bank/games/barcode/${barcode}`)
        .expect(404)
        .expect({
          message: 'Game not found',
          error: 'Not Found',
          statusCode: 404
        });
    });

    it('should return game when found in database', async () => {
      const game = await prismaService.game.create({
        data: {
          name: 'Test Game',
          barcodes: ['0123456789'],
          category: GameCategoryEnum.mainGame,
          firstReleaseDate: new Date('2025-02-21'),
          igdbGameId: 123,
          coverUrl: 'https://example.com/cover.jpg',
          summary: 'A test game',
          storyline: null,
          franchises: [],
          genres: [],
          screenshotsUrl: [],
        },
      });

      await request(app.getHttpServer())
        .get(`/bank/games/barcode/${game.barcodes[0]}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toMatchObject({
            name: game.name,
            barcodes: game.barcodes,
            category: game.category,
          });
        });
    });
  });

  describe('GET /bank/games/search', () => {
    it('should return 404 when no games match search', async () => {
      const query = 'ThisGameDefinitelyDoesNotExist';

      await request(app.getHttpServer())
        .get('/bank/games/search')
        .send({ query })
        .expect(404)
        .expect({
          message: 'No games found matching the search criteria',
          error: 'Not Found',
          statusCode: 404
        });
    });

    it('should return matching games', async () => {
      const query = 'Test Game';
      const game = await prismaService.game.create({
        data: {
          name: 'Test Game',
          barcodes: [],
          category: GameCategoryEnum.mainGame,
          firstReleaseDate: new Date('2025-02-21'),
          igdbGameId: 123,
          coverUrl: 'https://example.com/cover.jpg',
          summary: 'A test game summary',
          storyline: 'A test game storyline',
          franchises: [],
          genres: [],
          screenshotsUrl: [],
        }
      });

      await request(app.getHttpServer())
        .get('/bank/games/search')
        .send({ query })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toMatchObject({
            name: game.name,
            category: game.category,
          });
        });
    });
  });
}); 