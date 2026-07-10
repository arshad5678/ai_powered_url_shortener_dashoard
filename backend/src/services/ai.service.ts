import { env } from '../config/env.js';
import { logger } from '../logger/index.js';

export class AiService {
  /**
   * Helper to perform exponential backoff delay.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validates if a string conforms to the short code/alias constraints:
   * - Max length 20
   * - Lowercase letters, numbers, and hyphens only
   */
  private validateAlias(alias: string): boolean {
    if (!alias || alias.length > 20) return false;
    return /^[a-z0-9-]+$/.test(alias);
  }

  /**
   * Generates a collection of 3 fallback aliases locally in case of AI execution issues.
   */
  generateFallbackSuggestions(title: string): string[] {
    logger.info(`[AIService] Generating local fallback suggestions for title: ${title}`);
    const cleanBase =
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 15) || 'link';

    const currentYear = new Date().getFullYear();

    return [cleanBase, `${cleanBase}-${currentYear}`, `${cleanBase}-deals`].map((val) =>
      val.substring(0, 20)
    );
  }

  /**
   * Suggests 3 URL-safe aliases using the Gemini API, with retry logic and fallback support.
   */
  async suggestAliases(title: string, originalUrl: string): Promise<string[]> {
    logger.info(`[AIService] Suggesting aliases for title: ${title}`);

    // If Gemini key is empty, skip calling API and return fallback immediately
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'replace-with-gemini-key') {
      logger.warn('[AIService] GEMINI_API_KEY is empty/placeholder. Returning local fallbacks.');
      return this.generateFallbackSuggestions(title);
    }

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Suggest exactly 3 URL-safe, short, lowercase, hyphen-separated aliases for a URL shortener link.
Context:
- Title: "${title}"
- Target URL: "${originalUrl}"

Rules:
1. Each suggestion must contain ONLY lowercase alphanumeric characters (a-z, 0-9) and hyphens. No uppercase letters, spaces, or special characters.
2. Max length of each suggestion is 20 characters.
3. Suggest exactly 3 items.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: 'OBJECT',
                  properties: {
                    suggestions: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                      description:
                        'Exactly 3 short URL-safe lowercase hyphen-separated suggestion aliases',
                    },
                  },
                  required: ['suggestions'],
                },
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API returned status code ${response.status}`);
        }

        const resJson = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error('Gemini API returned an empty completion response.');
        }

        const parsed = JSON.parse(rawText);
        const rawSuggestions: string[] = parsed.suggestions;

        if (!Array.isArray(rawSuggestions) || rawSuggestions.length !== 3) {
          throw new Error(`AI generated ${rawSuggestions?.length || 0} suggestions instead of 3.`);
        }

        // Validate format constraints for every single alias
        const validSuggestions = rawSuggestions.filter((a) => this.validateAlias(a));
        if (validSuggestions.length !== 3) {
          throw new Error('One or more AI generated suggestions violated validation parameters.');
        }

        logger.info('[AIService] Successfully generated suggestions using Gemini.');
        return validSuggestions;
      } catch (err) {
        attempt++;
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.warn(`[AIService] Generation attempt ${attempt} failed: ${errMsg}`);

        if (attempt < maxRetries) {
          const delayTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
          await this.delay(delayTime);
        }
      }
    }

    // Default Fallback
    return this.generateFallbackSuggestions(title);
  }
}
