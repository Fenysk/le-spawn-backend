import { Inject, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Client } from 'minio';
import { Readable } from 'stream';
import { UploadResponseDto } from './dto/uploaded-file.response';
import { UploadedFileType } from './dto/uploaded-file.type';
import { STORAGE_CONSTANTS } from './storage.constants';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);

    constructor(
        @Inject('MINIO') private readonly minioClient: Client
    ) {
        this.initializeDefaultBucket();
    }

    private async initializeDefaultBucket(): Promise<void> {
        try {
            const bucketExists = await this.minioClient.bucketExists(STORAGE_CONSTANTS.DEFAULT_BUCKET);
            if (!bucketExists)
                await this.minioClient.makeBucket(STORAGE_CONSTANTS.DEFAULT_BUCKET);
        } catch (error) {
            this.logger.error('Failed to initialize default bucket', error);
            throw error;
        }
    }

    async uploadFile(
        file: Express.Multer.File,
        bucket: string = STORAGE_CONSTANTS.DEFAULT_BUCKET,
    ): Promise<UploadResponseDto> {
        try {
            const filename = `${Date.now()}-${file.originalname}`;
            const metaData = {
                'Content-Type': file.mimetype,
            };
            await this.minioClient.putObject(
                bucket,
                filename,
                file.buffer,
                file.size,
                metaData,
            );
            const fileInfo: UploadedFileType = {
                bucket,
                filename,
                etag: '', // Minio doesn't return etag on putObject
                size: file.size,
                mimetype: file.mimetype,
                path: `/${bucket}/${filename}`,
            };
            const url = await this.getFilePublicUrl(filename, bucket);
            return {
                url,
                fileInfo,
            };
        } catch (error) {
            this.logger.error('Failed to upload file', error);

            if (error.code === 'NoSuchBucket')
                throw new NotFoundException(`Bucket ${bucket} does not exist`);

            throw error;
        }
    }

    async getFile(
        filename: string,
        bucket: string = STORAGE_CONSTANTS.DEFAULT_BUCKET,
    ): Promise<Readable> {
        try {
            return await this.minioClient.getObject(bucket, filename);
        } catch (error) {
            this.logger.error('Failed to get file', error);

            if (error.code === 'NoSuchBucket')
                throw new BadRequestException(`Bucket ${bucket} does not exist`);
            
            if (error.code === 'NoSuchKey')
                throw new NotFoundException(`File ${filename} not found in bucket ${bucket}`);

            if (error.code === 'SignatureDoesNotMatch')
                throw new BadRequestException('Invalid authentication credentials for storage access');

            throw error;
        }
    }

    async getFilePrivateUrl(
        filename: string,
        bucket: string = STORAGE_CONSTANTS.DEFAULT_BUCKET,
        expiresIn: number = STORAGE_CONSTANTS.DEFAULT_URL_EXPIRATION,
    ): Promise<string> {
        try {
            return await this.minioClient.presignedGetObject(bucket, filename, expiresIn);
        } catch (error) {
            this.logger.error('Failed to get file URL', error);

            if (error.code === 'NoSuchBucket')
                throw new BadRequestException(`Bucket ${bucket} does not exist`);
            
            if (error.code === 'NoSuchKey')
                throw new NotFoundException(`File ${filename} not found in bucket ${bucket}`);

            if (error.code === 'SignatureDoesNotMatch')
                throw new BadRequestException('Invalid authentication credentials for storage access');

            throw error;
        }
    }

    async getFilePublicUrl(
        filename: string,
        bucket: string = STORAGE_CONSTANTS.DEFAULT_BUCKET,
    ): Promise<string> {
        try {
            const url = await this.minioClient.presignedGetObject(bucket, filename);
            const parsedUrl = new URL(url);
            return `${parsedUrl.origin}${parsedUrl.pathname}`;
        } catch (error) {
            this.logger.error('Failed to get public file URL', error);

            if (error.code === 'NoSuchBucket')
                throw new BadRequestException(`Bucket ${bucket} does not exist`);

            if (error.code === 'NoSuchKey')
                throw new NotFoundException(`File ${filename} not found in bucket ${bucket}`);

            if (error.code === 'SignatureDoesNotMatch')
                throw new BadRequestException('Invalid authentication credentials for storage access');

            throw error;
        }
    }

    async deleteFile(
        filename: string,
        bucket: string = STORAGE_CONSTANTS.DEFAULT_BUCKET,
    ): Promise<string> {
        try {
            await this.minioClient.removeObject(bucket, filename);
            return `File ${filename} deleted from bucket ${bucket}`;
        } catch (error) {
            this.logger.error('Failed to delete file', error);

            if (error.code === 'NoSuchBucket')
                throw new BadRequestException(`Bucket ${bucket} does not exist`);

            if (error.code === 'NoSuchKey')
                throw new NotFoundException(`File ${filename} not found in bucket ${bucket}`);

            if (error.code === 'SignatureDoesNotMatch')
                throw new BadRequestException('Invalid authentication credentials for storage access');

            throw error;
        }
    }

    async deleteFileFromUrl(
        url: string,
        bucket: string = STORAGE_CONSTANTS.DEFAULT_BUCKET,
    ): Promise<string> {
        try {
            const parsedUrl = new URL(url);
            const filename = parsedUrl.pathname.slice(1);
            await this.minioClient.removeObject(bucket, filename);
            return `File ${filename} deleted from bucket ${bucket}`;
        } catch (error) {
            this.logger.error('Failed to delete file from URL', error);

            if (error.code === 'NoSuchBucket')
                throw new BadRequestException(`Bucket ${bucket} does not exist`);

            if (error.code === 'NoSuchKey') {
                const parsedUrl = new URL(url);
                const filename = parsedUrl.pathname.slice(1);
                throw new NotFoundException(`File ${filename} not found in bucket ${bucket}`);
            }
            
            throw error;
        }
    }

} 