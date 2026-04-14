import { GoogleGenAI, Type } from "@google/genai";
import { Question, GenerationParams } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateQuestions(params: GenerationParams): Promise<Question[]> {
  const { topic, count, difficulty, type, language } = params;

  const prompt = `Gere ${count} questões de ${type} sobre o seguinte tópico ou texto: "${topic}". 
  Nível de dificuldade: ${difficulty}. 
  Idioma: ${language}.
  Para cada questão, forneça 4 opções (se for múltipla escolha) ou 2 opções (se for verdadeiro/falso), a resposta correta e uma breve explicação.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result.map((q: any, index: number) => ({
      ...q,
      id: `q-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error("Erro ao gerar questões:", error);
    throw error;
  }
}
