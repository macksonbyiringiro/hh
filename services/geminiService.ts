
import { GoogleGenAI, Chat } from "@google/genai";
import { Crop, Language, Message } from "../types";

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


// --- New Chat Functionality ---

const chatSessions = new Map<string, Chat>();

interface GeminiHistoryItem {
    role: 'user' | 'model';
    parts: { text: string }[];
}

const buildGeminiHistory = (messages: Message[], aiUserId: string): GeminiHistoryItem[] => {
    return messages
        .filter(msg => msg.type === 'text')
        .map(msg => ({
            role: msg.senderId === aiUserId ? 'model' : 'user',
            parts: [{ text: msg.text! }]
        }));
};


export const getAiChatResponse = async (conversationId: string, messages: Message[], aiUserId: string, language: Language): Promise<string> => {
    if (!ai) {
        throw new Error("AI Service not configured. API Key is missing.");
    }

    let chat = chatSessions.get(conversationId);
    const lastMessage = messages[messages.length - 1];
    
    const languageMap = {
      [Language.EN]: 'English',
      [Language.RW]: 'Kinyarwanda',
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
        const response = await chat.sendMessage({ message: lastMessage.text! });
        return response.text;
    } catch (error) {
        console.error("Error getting AI chat response:", error);
        chatSessions.delete(conversationId);
        return "I'm having some trouble connecting right now. Please try again later.";
    }
};