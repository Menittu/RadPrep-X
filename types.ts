
export interface Question {
  id?: number;
  chapter: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Bookmark {
  questionId: number;
  timestamp: number;
}

export interface Attempt {
  id?: number;
  timestamp: number;
  chapter?: string; // Optional if mixed
  score: number;
  total: number;
  mode: 'Practice' | 'Mock';
  questionIds: number[];
  userAnswers: (number | null)[];
}

export interface ActiveSession {
  id: string; // 'current' or similar
  type: 'Practice' | 'Mock';
  chapter?: string;
  questionIds: number[];
  currentIdx: number;
  answers: (number | null)[];
  startTime: number;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  PRACTICE = 'practice',
  MOCK = 'mock',
  SEARCH = 'search',
  ANALYTICS = 'analytics',
  VAULT = 'vault',
  BOOKMARKS = 'bookmarks'
}
