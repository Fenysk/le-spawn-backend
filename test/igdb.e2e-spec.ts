import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IgdbModule } from '../src/igdb/igdb.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwitchModule } from '../src/twitch/twitch.module';
import { CommonModule } from '@/common/common.module';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('IgdbController (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;

  beforeEach(async () => {
    await delay(1000);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true
        }),
        CommonModule,
        TwitchModule,
        IgdbModule
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configService = app.get<ConfigService>(ConfigService);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/igdb/game/id/:id (GET)', () => {
    const testGameId = configService.get<string>('TEST_GAME_ID');
    return request(app.getHttpServer())
      .get(`/igdb/game/id/${testGameId}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body)).toBeTruthy();
        if (res.body.length > 0) {
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        }
      });
  });

  it('/igdb/game/name/:name (GET)', () => {
    const testGameName = configService.get<string>('TEST_GAME_NAME');
    return request(app.getHttpServer())
      .get(`/igdb/game/name/${testGameName}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body)).toBeTruthy();
        if (res.body.length > 0) {
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        }
      });
  });

  it('/igdb/platform/:id (GET)', () => {
    const testPlatformId = configService.get<string>('TEST_PLATFORM_ID');
    return request(app.getHttpServer())
      .get(`/igdb/platform/${testPlatformId}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
      });
  });

  it('/igdb/game/id/:id should return 404 for non-existent game', () => {
    return request(app.getHttpServer())
      .get('/igdb/game/id/999999')
      .expect(404);
  });

  it('/igdb/game/id/:id should return 400 for invalid id', () => {
    return request(app.getHttpServer())
      .get('/igdb/game/id/invalid')
      .expect(400);
  });

  it('/igdb/game/name/:name should return 404 for non-existent game', () => {
    return request(app.getHttpServer())
      .get('/igdb/game/name/ThisGameDefinitelyDoesNotExist')
      .expect(404);
  });

  it('/igdb/game/name/:name should return 404 for empty name', () => {
    return request(app.getHttpServer())
      .get('/igdb/game/name/ ')
      .expect(404);
  });

  it('/igdb/platform/:id should return 404 for non-existent platform', () => {
    return request(app.getHttpServer())
      .get('/igdb/platform/999999')
      .expect(404);
  });

  it('/igdb/platform/:id should return 400 for invalid id', () => {
    return request(app.getHttpServer())
      .get('/igdb/platform/invalid')
      .expect(400);
  });

  describe('Rate limiting', () => {
    it('should handle rate limiting gracefully', async () => {
      const testGameId = configService.get<string>('TEST_GAME_ID');
      const promises = Array(5).fill(null).map(() => 
        request(app.getHttpServer())
          .get(`/igdb/game/id/${testGameId}`)
      );
      
      const results = await Promise.all(promises);
      results.forEach(res => {
        expect([200, 429]).toContain(res.status);
        if (res.status === 200) {
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        }
        if (res.status === 429) {
          expect(res.body).toHaveProperty('message');
        }
      });
    });
  });

  it('should return complete game data structure', () => {
    const testGameId = configService.get<string>('TEST_GAME_ID');
    return request(app.getHttpServer())
      .get(`/igdb/game/id/${testGameId}`)
      .expect(200)
      .expect(res => {
        expect(res.body[0]).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          slug: expect.any(String),
          url: expect.any(String)
        });
        if (res.body[0].cover) {
          expect(res.body[0].cover).toMatchObject({
            id: expect.any(Number),
            url: expect.any(String)
          });
        }
        if (res.body[0].genres?.length > 0) {
          expect(res.body[0].genres[0]).toMatchObject({
            id: expect.any(Number),
            name: expect.any(String)
          });
        }
      });
  });
}); 