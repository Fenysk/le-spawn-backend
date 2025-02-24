import { IGDBGameLocalizationRegion } from '@/igdb/interface/igdb-game-localization.response';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Region } from '@prisma/client';

@Injectable()
export class RegionService {
    constructor(private readonly prisma: PrismaService) {}

    async upsertRegion(region: IGDBGameLocalizationRegion): Promise<Region> {
        const existingRegion = await this.prisma.region.upsert({
            where: {
                name_abbreviation: {
                    name: region.name,
                    abbreviation: region.identifier,
                }
            },
            update: {
                name: region.name,
                abbreviation: region.identifier,
            },
            create: {
                name: region.name,
                abbreviation: region.identifier,
            },
        });

        return existingRegion;
    }
}
