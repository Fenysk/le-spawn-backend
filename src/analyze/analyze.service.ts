import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MistralService } from './mistral/mistral.service';
import { JsonService } from '@/common/services/json.service';
import { PROMPTS } from './constants/prompts.constant';
import { GameAnalyzeResponse } from './dto/game-analyze.response';
import { Game } from '@prisma/client';

@Injectable()
export class AnalyzeService {
  private readonly logger = new Logger(AnalyzeService.name);

  constructor(
    private readonly mistralService: MistralService,
    private readonly jsonService: JsonService,
  ) { }

  async analyzeMultipleImages(images: string[], prompt: string): Promise<string> {
    try {
      const analysis = await this.mistralService.analyzeImages(images, prompt);

      return analysis;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Error analyzing multiple images', error);
      throw new BadRequestException('Error analyzing multiple images');
    }
  }

  async analyzeGameFromImages(images: string[]): Promise<GameAnalyzeResponse> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const analysis = await this.mistralService.analyzeImages(images, PROMPTS.GAME);

        const parsedAnalysis = this.jsonService.extractJson(analysis) as GameAnalyzeResponse;

        return parsedAnalysis;
      } catch (error) {
        this.logger.error(`Error analyzing images on attempt ${attempt + 1}`, error);
        attempt++;
      }
    }

    throw new BadRequestException('Invalid JSON in analysis after multiple attempts');
  }

  private sanitizeGamesList(games: Game[]): (Pick<Game, 'id' | 'name' | 'firstReleaseDate' | 'storyline' | 'summary' | 'franchises' | 'genres'> & { platformsRelation?: any[] })[] {
    return games.map(game => ({
      id: game.id,
      name: game.name,
      firstReleaseDate: game.firstReleaseDate,
      storyline: game.storyline,
      summary: game.summary,
      franchises: game.franchises,
      genres: game.genres,
      platformsRelation: (game as any).platformsRelation,
    }));
  }

  async compareGamesListFromAnalyzeResponse(analyzeResponse: GameAnalyzeResponse, appGames: Game[]): Promise<Game> {
    const maxRetries = 3;
    let attempt = 0;
    
    // Sanitize the games list to keep only essential information
    const sanitizedGames = this.sanitizeGamesList(appGames);

    while (attempt < maxRetries) {
      try {
        const text = `
        Correct game info :
        ${JSON.stringify(analyzeResponse, null, 2)}

        List of games :
        ${JSON.stringify(sanitizedGames, null, 2)}
        `
        const analysis = await this.mistralService.analyzeText(text, PROMPTS.COMPARE_GAMES_LIST);

        const parsedAnalysis = this.jsonService.extractJson(analysis) as { gameId: string };

        const gameFound: Game | undefined = appGames.find(game => game.id === parsedAnalysis.gameId);

        if (!gameFound)
          throw new NotFoundException('Game not found in the list');

        return gameFound;
      } catch (error) {
        this.logger.error(`Error analyzing games list on attempt ${attempt + 1}`, error);
        attempt++;
      }
    }
  }

}