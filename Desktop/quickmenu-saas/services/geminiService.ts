
import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../types";

export const generateAIMenu = async (cuisine: string, businessName: string): Promise<{ items: Partial<MenuItem>[], categories: string[] }> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("Missing API Key");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `Create a professional menu for a restaurant named "${businessName}" specializing in ${cuisine}. Provide a list of 10 items with creative names, descriptions, realistic prices in EUR, and appropriate categories (e.g. Appetizers, Mains, Drinks).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          categories: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.NUMBER },
                category: { type: Type.STRING }
              },
              required: ["name", "description", "price", "category"]
            }
          }
        },
        required: ["categories", "items"]
      }
    }
  });

  return JSON.parse(response.text);
};
