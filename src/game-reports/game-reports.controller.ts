import { Controller, Post, Get, Body, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GameReportsService } from './game-reports.service';
import { CreateGameReportDto } from './dto/create-game-report.dto';
import { GameReport, Role } from '@prisma/client';
import { Roles } from '@/common/decorator/roles.decorator';
import { GetUser } from '@/common/decorator/get-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Game Reports')
@Controller('game-reports')
export class ReportsController {
  constructor(private readonly gameReportsService: GameReportsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new game report' })
  @ApiResponse({ status: 201, description: 'The report has been successfully created.' })
  async createReport(
    @GetUser() user: User,
    @Body() createGameReportDto: CreateGameReportDto
  ): Promise<GameReport> {
    return this.gameReportsService.createReport(user.id, createGameReportDto);
  }

  @Get('game/:gameId')
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reports for a specific game' })
  async getReportsByGame(
    @Param('gameId') gameId: string
  ): Promise<GameReport[]> {
    return this.gameReportsService.getReportsByGame(gameId);
  }

  @Get('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reports created by the current user' })
  async getMyReports(
    @GetUser() user: User
  ): Promise<GameReport[]> {
    return this.gameReportsService.getReportsByUser(user.id);
  }

  @Put(':reportId/status')
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the status of a report' })
  async updateReportStatus(
    @Param('reportId') reportId: string,
    @Body('status') status: 'pending' | 'inProgress' | 'resolved' | 'rejected'
  ): Promise<GameReport> {
    return this.gameReportsService.updateReportStatus(reportId, status);
  }
}