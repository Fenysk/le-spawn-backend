import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Collection } from '@prisma/client';
import { CreateCollectionRequest } from '@/collections/dto/create-collection.request';
import { UpdateCollectionRequest } from '@/collections/dto/update-collection.request';

@Injectable()
export class CollectionsService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async getMyCollections(
        userId: string
    ): Promise<Collection[]> {
        try {
            return await this.prismaService.collection.findMany({
                where: { userId },
                include: {
                    gameItems: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                        include: {
                            game: {
                                include: {
                                    gameLocalizations: {
                                        include: {
                                            region: true
                                        }
                                    },
                                    platformsRelation: {
                                        include: {
                                            platform: true
                                        }
                                    }
                                }
                            },
                        }
                    }
                }
            });
        } catch (error) {
            throw error;
        }
    }


    async getCollectionById(
        userId: string,
        id: string
    ): Promise<Collection> {
        try {
            const collection = await this.prismaService.collection.findUnique({
                where: { id },
                include: {
                    gameItems: {
                        include: {
                            game: {
                                include: {
                                    gameLocalizations: {
                                        include: {
                                            region: true
                                        }
                                    },
                                    platformsRelation: {
                                        include: {
                                            platform: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!collection || collection.userId !== userId)
                throw new NotFoundException('Collection not found');

            return collection;
        } catch (error) {
            throw error;
        }
    }

    async createCollection(
        userId: string,
        newCollectionData: CreateCollectionRequest
    ): Promise<Collection> {
        return this.prismaService.collection.create({
            data: {
                userId,
                ...newCollectionData,
            }
        });
    }

    async updateCollection(
        userId: string,
        id: string,
        updateCollectionData: UpdateCollectionRequest
    ): Promise<Collection> {
        const collection = await this.prismaService.collection.findUnique({
            where: { id }
        });

        if (!collection || collection.userId !== userId)
            throw new NotFoundException('Collection not found or unauthorized');

        return this.prismaService.collection.update({
            where: { id },
            data: updateCollectionData
        });
    }

    async deleteCollection(
        userId: string,
        collectionId: string
    ): Promise<string> {
        try {
            const existingCollection = await this.prismaService.collection.findUnique({ where: { id: collectionId } });

            if (!existingCollection || existingCollection.userId !== userId)
                throw new NotFoundException(`Collection with ID ${collectionId} not found`);

            await this.prismaService.collection.delete({ where: { id: collectionId } });

            return `Collection with ID ${collectionId} has been successfully deleted`;
        } catch (error) {
            throw error;
        }
    }


}
