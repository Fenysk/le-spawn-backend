import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwitchService } from './twitch.service';
import { ApiService } from '@/common/services/api.service';
import { TwitchAuthResponse } from './interface/twitch-auth.response';
import { HttpMethodEnum } from '@/common/enums/http-method.enum';
import { InternalServerErrorException } from '@nestjs/common';

describe('TwitchService', () => {
  let service: TwitchService;
  let configService: ConfigService;
  let apiService: ApiService;

  const mockApiService = {
    requestToApi: jest.fn()
  };

  const mockAuthResponse: TwitchAuthResponse = {
    access_token: 'mock-access-token',
    expires_in: 5000,
    token_type: 'bearer'
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test'
        })
      ],
      providers: [
        TwitchService,
        ConfigService,
        {
          provide: ApiService,
          useValue: mockApiService
        }
      ],
    }).compile();

    service = module.get<TwitchService>(TwitchService);
    configService = module.get<ConfigService>(ConfigService);
    apiService = module.get<ApiService>(ApiService);

    // Reset the mock implementation for each test
    mockApiService.requestToApi.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with correct oauth URL from env', () => {
    const expectedUrl = configService.get<string>('TWITCH_OAUTH_URL');
    expect(service.oauthUrl).toBe(expectedUrl);
  });

  it('should initialize with null access token', () => {
    expect(service.accessToken).toBeNull();
  });

  describe('getAccessToken', () => {
    it('should successfully get access token using env credentials', async () => {
      mockApiService.requestToApi.mockResolvedValueOnce(mockAuthResponse);

      const result = await service.getAccessToken();
      const clientId = configService.get<string>('TWITCH_CLIENT_ID');
      const clientSecret = configService.get<string>('TWITCH_CLIENT_SECRET');

      expect(result).toEqual(mockAuthResponse);
      expect(apiService.requestToApi).toHaveBeenCalledWith({
        baseUrl: configService.get<string>('TWITCH_OAUTH_URL'),
        method: HttpMethodEnum.POST,
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials'
        }
      });
    });

    it('should throw error when API request fails', async () => {
      const error = new Error('API Error');
      mockApiService.requestToApi.mockRejectedValueOnce(error);

      await expect(service.getAccessToken()).rejects.toThrow('API Error');
    });

    it('should throw InternalServerErrorException when required env variables are missing', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'TWITCH_OAUTH_URL') return 'url';  // Need this for constructor
        return undefined;
      });

      const service = new TwitchService(configService, apiService);
      await expect(service.getAccessToken()).rejects.toThrow(InternalServerErrorException);
      await expect(service.getAccessToken()).rejects.toThrow('Twitch credentials are not properly configured');
    });

    it('should throw InternalServerErrorException when only client ID is missing', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'TWITCH_CLIENT_ID') return undefined;
        if (key === 'TWITCH_CLIENT_SECRET') return 'secret';
        if (key === 'TWITCH_OAUTH_URL') return 'url';
        return undefined;
      });

      const service = new TwitchService(configService, apiService);
      await expect(service.getAccessToken()).rejects.toThrow(InternalServerErrorException);
      await expect(service.getAccessToken()).rejects.toThrow('Twitch credentials are not properly configured');
    });

    it('should throw InternalServerErrorException when only client secret is missing', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'TWITCH_CLIENT_ID') return 'id';
        if (key === 'TWITCH_CLIENT_SECRET') return undefined;
        if (key === 'TWITCH_OAUTH_URL') return 'url';
        return undefined;
      });

      const service = new TwitchService(configService, apiService);
      await expect(service.getAccessToken()).rejects.toThrow(InternalServerErrorException);
      await expect(service.getAccessToken()).rejects.toThrow('Twitch credentials are not properly configured');
    });

    it('should throw InternalServerErrorException when API returns null', async () => {
      mockApiService.requestToApi.mockResolvedValueOnce(null);

      try {
        await service.getAccessToken();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Invalid response from Twitch API');
      }
    });
  });
}); 