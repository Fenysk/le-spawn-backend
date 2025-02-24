import { Injectable } from '@nestjs/common';

@Injectable()
export class JsonService {

  extractJson(text: string): any {
    const startIndex = text.indexOf('{') !== -1 ? text.indexOf('{') : text.indexOf('[');
    if (startIndex === -1) {
      throw new Error('No JSON object or array found in the text.');
    }

    const endIndex = text.lastIndexOf('}') !== -1 ? text.lastIndexOf('}') + 1 : text.lastIndexOf(']') + 1;
    if (endIndex === 0) {
      throw new Error('No JSON object or array found in the text.');
    }

    const potentialJson = text.substring(startIndex, endIndex);

    if (!this.isValidJson(potentialJson)) {
      throw new Error('Extracted text is not valid JSON.');
    }

    return JSON.parse(potentialJson);
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