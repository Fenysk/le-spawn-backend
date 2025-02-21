import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwitchModule } from '../src/twitch/twitch.module';
import { CommonModule } from '@/common/common.module';

describe('TwitchController (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;

  beforeEach(async () => {
    const rateLimit = process.env.TEST_RATE_LIMIT_DELAY || 1000;
    await new Promise(resolve => setTimeout(resolve, Number(rateLimit)));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true
        }),
        CommonModule,
        TwitchModule
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configService = app.get<ConfigService>(ConfigService);

    const requiredEnvVars = [
      'TWITCH_OAUTH_URL',
      'TWITCH_CLIENT_ID',
      'TWITCH_CLIENT_SECRET'
    ];
    
    requiredEnvVars.forEach(envVar => {
      const value = configService.get<string>(envVar);
      if (!value) {
        throw new Error(`Required environment variable ${envVar} is not set in .env.test`);
      }
    });

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Authentication', () => {
    it('should successfully get Twitch access token', async () => {
      const response = await request(app.getHttpServer())
        .get('/twitch/auth')
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('expires_in');
      expect(response.body).toHaveProperty('token_type', 'bearer');
    });

    it('should handle rate limiting gracefully', async () => {
      const maxRequests = Number(configService.get<string>('TEST_RATE_LIMIT_REQUESTS')) || 5;
      const promises = Array(maxRequests).fill(null).map(() => 
        request(app.getHttpServer())
          .get('/twitch/auth')
      );
      
      const results = await Promise.all(promises);
      results.forEach(res => {
        expect([200, 429]).toContain(res.status);
        if (res.status === 200) {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('token_type', 'bearer');
        }
        if (res.status === 429) {
          expect(res.body).toHaveProperty('message');
        }
      });
    });

    it('should return 500 when Twitch credentials are invalid', async () => {
      const moduleWithInvalidCreds = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            load: [() => ({
              TWITCH_CLIENT_ID: 'invalid-client-id',
              TWITCH_CLIENT_SECRET: 'invalid-client-secret',
              TWITCH_OAUTH_URL: configService.get('TWITCH_OAUTH_URL')
            })],
            isGlobal: true
          }),
          CommonModule,
          TwitchModule
        ],
      }).compile();

      const testApp = moduleWithInvalidCreds.createNestApplication();
      await testApp.init();

      try {
        await request(testApp.getHttpServer())
          .get('/twitch/auth')
          .expect(500);
      } finally {
        await testApp.close();
      }
    });
  });

  describe('Health Check', () => {
    it('/twitch/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/twitch/health')
        .expect(200)
        .expect({ status: 'ok' });
    });
  });
}); 