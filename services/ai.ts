import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AIResponse {
  text: string;
  groundingMetadata?: any;
}

export const generateMarketInsights = async (query: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide market insights and up-to-date pricing or trends for: ${query}. Focus on information relevant to a small shop owner.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      text: response.text || "No response generated.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Failed to fetch market insights. Please try again.");
  }
};

export const chatWithAI = async (message: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: message,
            config: {
                systemInstruction: "You are a helpful assistant for a shop owner using ShopLedger. Keep answers concise, professional, and helpful."
            }
        });
        return response.text || "";
    } catch (error) {
        console.error("AI Error:", error);
        throw error;
    }
}

export const analyzeShopPerformance = async (salesData: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this sales data summary and provide 3 brief, actionable tips for the shop owner to improve profit or stock management:\n${salesData}`,
        });
        return response.text || "";
    } catch (error) {
         console.error("AI Error:", error);
        throw error;
    }
}