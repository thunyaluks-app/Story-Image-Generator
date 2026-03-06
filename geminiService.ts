
import { GoogleGenAI } from "@google/genai";
import { MessageTone, MessagePlatform } from "./types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async refineMessage(
    text: string, 
    tone: MessageTone, 
    platform: MessagePlatform
  ): Promise<string> {
    const prompt = `Refine and improve the following message.
    
    Context:
    - Target Platform: ${platform}
    - Desired Tone: ${tone}
    - Original Message: "${text}"
    
    Instructions:
    1. Maintain the original core meaning but improve clarity, grammar, and impact.
    2. Adapt the structure to perfectly fit a ${platform} environment.
    3. Ensure the tone is strictly ${tone}.
    4. Provide only the refined text, no preamble or explanation.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
        }
      });

      return response.text || "Failed to generate message. Please try again.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Communication with AI failed. Ensure your connection is stable.");
    }
  }

  async translateMessage(text: string, targetLanguage: string): Promise<string> {
    const prompt = `Translate the following text into ${targetLanguage}. 
    Text: "${text}"
    Return ONLY the translated text.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || text;
    } catch (error) {
      console.error("Translation Error:", error);
      return text;
    }
  }
}

export const geminiService = new GeminiService();
