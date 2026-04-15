import { ListingSummary } from "./listing.type";

export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant' | 'system';
  sessionId?: string;
}

export interface ChatResponse {
  content: string;
  sessionId: string;
  timestamp: Date;
  relatedListings?: Partial<ListingSummary>[];
}