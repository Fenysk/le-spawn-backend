import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { NewPlatformRequest } from '@/bank/dto/new-platform.request';
import { Platform, Prisma } from '@prisma/client';
import { SearchPlatformsRequest } from '@/bank/dto/search-platforms.request';

@Injectable()
export class PlatformsBankService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async searchPlatforms(searchPlatformsDto: SearchPlatformsRequest): Promise<Platform[]> {
        try {
            const whereConditions: Prisma.PlatformWhereInput[] = [];

            if (searchPlatformsDto.query)
                whereConditions.push({ name: { contains: searchPlatformsDto.query, mode: 'insensitive' } });

            const platforms = await this.prismaService.platform.findMany({
                where: whereConditions.length ? { OR: whereConditions } : {},
            });

            if (!platforms.length)
                throw new NotFoundException('No platforms found matching the search criteria');

            return platforms;
        } catch (error) {
            throw error;
        }
    }

    async getPlatformWithIgdbId(id: number): Promise<Platform> {
        try {
            const platform = await this.prismaService.platform.findUnique({
                where: {
                    igdbPlatformId: id
                }
            });

            if (!platform)
                throw new NotFoundException('Platform not found in bank');

            return platform;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async addPlatformToBank(
        platformData: NewPlatformRequest
    ): Promise<Platform> {
        try {
            const newPlatform = await this.prismaService.platform.upsert({
                where: {
                    igdbPlatformId: platformData.igdbPlatformId
                },
                update: {
                    name: platformData.name,
                    abbreviation: platformData.abbreviation,
                    generation: platformData.generation,
                    logoUrl: platformData.logoUrl
                },
                create: {
                    igdbPlatformId: platformData.igdbPlatformId,
                    name: platformData.name,
                    abbreviation: platformData.abbreviation,
                    generation: platformData.generation,
                    logoUrl: platformData.logoUrl
                }
            });
            return newPlatform;
        } catch (error) {
            throw error;
        }
    }
}
