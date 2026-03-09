import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// The API key is injected by the AI Studio environment
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyCl8qcFipedDnu76jhQ_FZeob9t0YXclFQ" });
