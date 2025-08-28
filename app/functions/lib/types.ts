export interface CsvRecord {
  question: string;
  answer: string;
  source: string;
  approved: string; // 'true' or 'false'
  last_updated: string; // YYYY-MM-DD
  [key: string]: string;
}

export interface RagResult {
  content: string;
  source: string;
  last_updated: string;
  score: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AskRequestBody {
  question: string;
  history?: ChatMessage[];
}
