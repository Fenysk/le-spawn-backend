import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CollectionsService } from '@/collections/collections.service';
import { CreateCollectionRequest } from '@/collections/dto/create-collection.request';
import { UpdateCollectionRequest } from '@/collections/dto/update-collection.request';
import { Collection, User } from '@prisma/client';
import { GetUser } from '@/common/decorator/get-user.decorator';

@Controller('collections')
export class CollectionsController {
    constructor(private readonly collectionsService: CollectionsService) { }

    @Get()
    getMyCollections(
        @GetUser() user: User,
    ): Promise<Collection[]> {
        return this.collectionsService.getMyCollections(user.id);
    }

    @Get(':id')
    getCollectionById(
        @GetUser() user: User,
        @Param('id') id: string,
    ): Promise<Collection> {
        return this.collectionsService.getCollectionById(user.id, id);
    }

    @Post()
    createCollection(
        @GetUser() user: User,
        @Body() createCollectionDto: CreateCollectionRequest,
    ): Promise<Collection> {
        return this.collectionsService.createCollection(user.id, createCollectionDto);
    }

    @Put(':id')
    updateCollection(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() updateCollectionDto: UpdateCollectionRequest
    ): Promise<Collection> {
        return this.collectionsService.updateCollection(user.id, id, updateCollectionDto);
    }

    @Delete(':id')
    deleteCollection(
        @GetUser() user: User,
        @Param('id') id: string
    ): Promise<string> {
        return this.collectionsService.deleteCollection(user.id, id);
    }
}
