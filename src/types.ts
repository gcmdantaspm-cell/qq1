export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type Difficulty = 'fácil' | 'médio' | 'difícil';
export type QuestionType = 'múltipla escolha' | 'verdadeiro/falso';

export interface GenerationParams {
  topic: string;
  count: number;
  difficulty: Difficulty;
  type: QuestionType;
  language: string;
}
