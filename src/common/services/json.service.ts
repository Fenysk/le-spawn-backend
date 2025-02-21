import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class JsonService {
  private readonly logger = new Logger(JsonService.name);

  extractJson(text: string): unknown {
    try {
      const startIndex = text.indexOf('{') !== -1 ? text.indexOf('{') : text.indexOf('[');
      if (startIndex === -1) return null;

      const endIndex = text.lastIndexOf('}') !== -1 ? text.lastIndexOf('}') + 1 : text.lastIndexOf(']') + 1;
      if (endIndex === 0) return null;

      const potentialJson = text.substring(startIndex, endIndex);

      const parsedJson = JSON.parse(potentialJson);
      return parsedJson;
    } catch (error) {
      this.logger.debug(`Failed to extract JSON from text: ${error.message}`);
      return null;
    }
  }

  isValidJson(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }
}