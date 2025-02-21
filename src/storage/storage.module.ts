import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [
    {
      provide: 'MINIO',
      useFactory: (configService: ConfigService) => {
        return new Client({
          endPoint: configService.getOrThrow<string>('MINIO_ENDPOINT'),
          port: configService.getOrThrow<number>('MINIO_PORT'),
          useSSL: Boolean(configService.get('MINIO_USE_SSL', false)),
          accessKey: configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
          secretKey: configService.getOrThrow<string>('MINIO_SECRET_KEY'),
          region: configService.get<string>('MINIO_REGION', 'us-east-1'),
          pathStyle: true,
          partSize: 10 * 1024 * 1024, // 10MB for better multipart handling
        });
      },
      inject: [ConfigService],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule { } 