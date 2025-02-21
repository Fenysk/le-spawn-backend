import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateGameReportDto } from './dto/create-game-report.dto';
import { GameReport } from '@prisma/client';

@Injectable()
export class GameReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(userId: string, dto: CreateGameReportDto): Promise<GameReport> {
    const game = await this.prisma.game.findUnique({
      where: { id: dto.gameId }
    });
    if (!game)
      throw new NotFoundException(`Game with ID ${dto.gameId} not found`);

    return this.prisma.gameReport.create({
      data: {
        gameId: dto.gameId,
        reporterId: userId,
        explication: dto.explication,
        status: 'pending'
      }
    });
  }

  async getReportsByGame(gameId: string): Promise<GameReport[]> {
    return this.prisma.gameReport.findMany({
      where: { gameId },
      include: {
        reporter: {
          select: {
            id: true,
            profile: {
              select: {
                displayName: true,
                pseudo: true
              }
            }
          }
        }
      }
    });
  }

  async getReportsByUser(userId: string): Promise<GameReport[]> {
    return this.prisma.gameReport.findMany({
      where: { reporterId: userId },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            coverUrl: true
          }
        }
      }
    });
  }

  async updateReportStatus(reportId: string, status: 'pending' | 'inProgress' | 'resolved' | 'rejected'): Promise<GameReport> {
    return this.prisma.gameReport.update({
      where: { id: reportId },
      data: { status }
    });
  }
} 