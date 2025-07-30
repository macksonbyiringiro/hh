
import { GoogleGenAI } from "@google/genai";
import { Crop, Language } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this context, we assume the key is set.
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateFarmingTipStream = async (crop: Crop, language: Language) => {
  const languageMap = {
    [Language.EN]: 'English',
    [Language.RW]: 'Kinyarwanda',
  };

  const prompt = `You are an expert agricultural advisor for East Africa. 
  Provide a concise, actionable list of 3-4 daily or weekly farming tips for growing ${crop} in Rwanda. 
  The tips should be practical for a small-scale farmer. Use simple language.
  Format the output as a markdown list.
  Respond in ${languageMap[language]}.`;

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
       config: {
        thinkingConfig: { thinkingBudget: 0 } // For faster response
      }
    });
    return stream;
  } catch (error) {
    console.error("Error generating content stream:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};
