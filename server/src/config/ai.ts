/**
 * AI provider configuration.
 * Supports both Gemini and Claude APIs.
 */
export const aiConfig = {
  provider: process.env.AI_PROVIDER || 'gemini',
  apiKey: process.env.AI_API_KEY || '',

  get isConfigured(): boolean {
    return !!this.apiKey;
  },
};

export default aiConfig;
