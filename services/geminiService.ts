
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Crop, Language, Message, Plot } from "../types";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

export const isConfigured = () => !!ai;

// This function is kept for the original dashboard feature
export const generateFarmingTipStream = async (crop: Crop, language: Language) => {
  if (!ai) {
     throw new Error("AI Service not configured. API Key is missing.");
  }
  const languageMap: Record<Language, string> = {
    [Language.EN]: 'English',
    [Language.RW]: 'Kinyarwanda',
    [Language.FR]: 'French',
    [Language.SW]: 'Swahili',
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


// --- New Chat Functionality ---

const chatSessions = new Map<string, Chat>();

interface GeminiHistoryItem {
    role: 'user' | 'model';
    parts: { text: string }[];
}

const buildGeminiHistory = (messages: Message[], aiUserId: string): GeminiHistoryItem[] => {
    return messages
        .filter(msg => msg.senderId !== 'system') // ignore system messages
        .map(msg => ({
            role: msg.senderId === aiUserId ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));
};


export const getAiChatResponse = async (conversationId: string, messages: Message[], aiUserId: string, language: Language): Promise<string> => {
    if (!ai) {
        throw new Error("AI Service not configured. API Key is missing.");
    }

    let chat = chatSessions.get(conversationId);
    const lastMessage = messages[messages.length - 1];
    
    const languageMap: Record<Language, string> = {
      [Language.EN]: 'English',
      [Language.RW]: 'Kinyarwanda',
      [Language.FR]: 'French',
      [Language.SW]: 'Swahili',
    };

    if (!chat) {
        const history = buildGeminiHistory(messages.slice(0, -1), aiUserId);
        
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: `You are a friendly and helpful agricultural assistant for farmers in East Africa, specifically Rwanda. Your name is Umuhinzi-Bot. Keep your answers concise and practical. Respond in ${languageMap[language]}.`,
            },
        });
        chatSessions.set(conversationId, chat);
    }
    
    try {
        const response = await chat.sendMessage({ message: lastMessage.text });
        return response.text;
    } catch (error) {
        console.error("Error getting AI chat response:", error);
        chatSessions.delete(conversationId);
        return "I'm having some trouble connecting right now. Please try again later.";
    }
};

export const getYieldPrediction = async (plot: Plot, language: Language): Promise<string> => {
    if (!ai) {
        throw new Error("AI Service not configured. API Key is missing.");
    }

    const prompt = `
        As an agricultural expert, predict the potential yield in tons per hectare for a plot of land with the following characteristics:
        - Crop: ${plot.crop}
        - Current Farming Stage: ${plot.farmingStage}
        - Location: Near Kigali, Rwanda (assume general climate and average rainfall for the region).

        Provide a single numerical value representing the predicted yield in tons per hectare. For example: "4.5". Do not add any extra text, units, or explanation. Just the number.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2, // Be more deterministic for this kind of task
            }
        });
        
        const yieldValue = response.text.trim().match(/(\d+(\.\d+)?)/);
        if (yieldValue) {
            return yieldValue[0];
        }
        // Fallback if the model doesn't return a clean number
        return "N/A";

    } catch (error) {
        console.error("Error generating yield prediction:", error);
        throw new Error("Failed to communicate with the AI model for prediction.");
    }
};

export const getAiDirections = async (startLocationText: string, end: [number, number], plotName: string, language: Language): Promise<{ directions: string; route: [number, number][] }> => {
    if (!ai) {
        throw new Error("AI Service not configured. API Key is missing.");
    }
    
    const languageMap: Record<Language, string> = {
      [Language.EN]: 'English',
      [Language.RW]: 'Kinyarwanda',
      [Language.FR]: 'French',
      [Language.SW]: 'Swahili',
    };

    const prompt = `
        You are a local guide in Rwanda.
        Provide walking or motorcycle directions and a route polyline from "${startLocationText}" to the farm plot named "${plotName}" at coordinates ${end.join(', ')}.
        - The narrative directions should be turn-by-turn, mention local landmarks, and be simple for a local farmer.
        - The route polyline should be an array of [latitude, longitude] coordinate pairs representing the path. The path should be realistic for rural roads or footpaths, and contain at least two points (start and end).
        - The response must be in ${languageMap[language]}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        narrative_directions: {
                            type: Type.STRING,
                            description: `Turn-by-turn directions in ${languageMap[language]} formatted as a markdown numbered list.`
                        },
                        route_polyline: {
                            type: Type.ARRAY,
                            description: 'An array of [latitude, longitude] coordinate pairs for the route.',
                            items: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.NUMBER
                                }
                            }
                        }
                    },
                    required: ["narrative_directions", "route_polyline"]
                },
            }
        });
        
        const responseJson = JSON.parse(response.text.trim());
        
        return {
            directions: responseJson.narrative_directions,
            route: responseJson.route_polyline,
        };

    } catch (error) {
        console.error("Error generating AI directions:", error);
        throw new Error("Failed to communicate with the AI model for directions.");
    }
};
