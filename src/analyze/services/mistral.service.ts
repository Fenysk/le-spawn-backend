import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { MistralVisionRequestDto } from '../dto/mistral/vision-request.dto';
import { MistralVisionResponseDto } from '../dto/mistral/vision-response.dto';

@Injectable()
export class MistralService {
  private readonly logger = new Logger(MistralService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.mistral.ai/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('MISTRAL_API_KEY');
  }

  async analyzeImage(request: MistralVisionRequestDto): Promise<MistralVisionResponseDto> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'pixtral-12b-2409',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: request.prompt },
                { type: 'image_url', image_url: `data:image/jpeg;base64,${request.imageBase64}` }
              ]
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        content: response.data.choices[0].message.content
      };
    } catch (error) {
      this.logger.error('Error calling Mistral Vision API', error);
      throw error;
    }
  }
} 