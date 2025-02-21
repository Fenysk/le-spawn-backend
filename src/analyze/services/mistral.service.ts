import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MistralService {
  private readonly logger = new Logger(MistralService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly MODEL = 'pixtral-12b-2409';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('MISTRAL_API_KEY');
    this.apiUrl = this.configService.getOrThrow<string>('MISTRAL_API_URL', 'https://api.mistral.ai/v1');
  }

  private validateApiResponse(data: any): void {
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0)
      throw new BadRequestException('Invalid response from Mistral API');
    if (!data.choices[0].message || !data.choices[0].message.content)
      throw new BadRequestException('Invalid message format from Mistral API');
  }

  async analyzeImages(imageUrls: string[], prompt: string): Promise<string> {
    try {
      const imageContents = imageUrls.map((url) => ({
        type: 'image_url',
        image_url: { url }
      }));

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                ...imageContents,
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.logger.error('Mistral API error', errorData);
        throw new BadRequestException('Error from Mistral API: ' + response.statusText);
      }

      const data = await response.json();
      this.validateApiResponse(data);
      return data.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error analyzing images', error);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to analyze images');
    }
  }
}