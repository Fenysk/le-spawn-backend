import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { STORAGE_CONSTANTS } from './storage.constants';
import { UploadResponseDto } from './dto/uploaded-file.response';
import { DeleteFileUrlRequest } from './dto/delete-file-url.request';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('bucket') bucket?: string,
    ): Promise<UploadResponseDto> {
        return this.storageService.uploadFile(file, bucket);
    }

    @Get(':filename')
    async getFile(
        @Param('filename') filename: string,
        @Query('bucket') bucket: string = STORAGE_CONSTANTS.DEFAULT_BUCKET,
        @Res() res: Response,
    ): Promise<void> {
        const fileStream = await this.storageService.getFile(filename, bucket);
        fileStream.pipe(res);
    }

    @Get('url/private/:filename')
    async getPrivateFileUrl(
        @Param('filename') filename: string,
        @Query('bucket') bucket: string = STORAGE_CONSTANTS.DEFAULT_BUCKET,
        @Query('expiresIn') expiresIn: number = STORAGE_CONSTANTS.DEFAULT_URL_EXPIRATION,
    ): Promise<{ url: string }> {
        const url = await this.storageService.getFilePrivateUrl(filename, bucket, expiresIn);
        return { url };
    }

    @Get('url/public/:filename')
    async getPublicFileUrl(
        @Param('filename') filename: string,
        @Query('bucket') bucket: string = STORAGE_CONSTANTS.DEFAULT_BUCKET,
    ): Promise<{ url: string }> {
        const url = await this.storageService.getFilePublicUrl(filename, bucket);
        return { url };
    }

    @Delete(':filename')
    async deleteFile(
        @Param('filename') filename: string,
        @Query('bucket') bucket: string = STORAGE_CONSTANTS.DEFAULT_BUCKET,
    ): Promise<string> {
        return this.storageService.deleteFile(filename, bucket);
    }

    @Delete('url')
    async deleteFileUrl(
        @Body() request: DeleteFileUrlRequest,
    ): Promise<string> {
        return this.storageService.deleteFileFromUrl(request.url, request.bucket);
    }
}