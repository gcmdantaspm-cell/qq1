import { GoogleGenAI, Type } from "@google/genai";
import { Question, GenerationParams } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateQuestions(params: GenerationParams): Promise<Question[]> {
  const { topic, count, difficulty, type, language } = params;

  const prompt = `Você é um especialista em criação de questões de concursos e exames. 
  Gere ${count} questões do tipo "${type}" baseadas estritamente no seguinte tópico ou texto: "${topic}". 
  Nível de dificuldade: ${difficulty}. 
  Idioma: ${language}.

  REGRAS CRÍTICAS:
  1. Se o tópico for um texto longo, extraia informações relevantes para criar as questões.
  2. Para questões de múltipla escolha, forneça exatamente 4 opções plausíveis.
  3. A "correctAnswer" DEVE ser idêntica a uma das strings dentro do array "options".
  4. A "explanation" deve ser didática, explicando por que a alternativa está correta e, se possível, por que as outras estão incorretas.
  5. Mantenha um tom profissional e formal, típico de bancas de concurso.`;

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
