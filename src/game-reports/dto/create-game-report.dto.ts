import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGameReportDto {
  @ApiProperty({
    description: 'The ID of the game being reported',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({
    description: 'Detailed explanation of the report',
    example: 'The release date information for this game is incorrect'
  })
  @IsString()
  @IsNotEmpty()
  explication: string;
} 