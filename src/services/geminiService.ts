import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function translateText(text: string, targetLanguage: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following English text to ${targetLanguage}. Provide ONLY the translated text without any extra notes or punctuation unless it's part of the translation.
      
      Text: "${text}"`,
    });
    
    return response.text?.trim() || "Tarjima topilmadi";
  } catch (error) {
    console.error("Translation error:", error);
    return "Xatolik yuz berdi";
  }
}

export async function generateQuizQuestion(phrase: string, targetLanguage: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a multiple-choice quiz question for the English phrase "${phrase}" translated into ${targetLanguage}.
      Provide the result in the following JSON format:
      {
        "phrase": "${phrase}",
        "correct": "the correct translation",
        "options": ["correct translation", "wrong option 1", "wrong option 2", "wrong option 3"]
      }
      Ensure the options are in ${targetLanguage} and are plausible. Provide ONLY the JSON.`,
    });
    
    const text = response.text?.trim() || "";
    // Clean JSON string in case of markdown blocks
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson) as { phrase: string; correct: string; options: string[] };
  } catch (error) {
    console.error("Quiz generation error:", error);
    return null;
  }
}
