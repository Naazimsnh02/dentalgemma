export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string;
  timestamp: number;
  isStreaming?: boolean;
};

export type ModelState =
  | 'checking'
  | 'not-found'
  | 'ready-to-load'
  | 'loading'
  | 'loaded'
  | 'error';

export type ModelFiles = {
  modelPath: string;
  mmprojPath: string;
  modelExists: boolean;
  mmprojExists: boolean;
};
