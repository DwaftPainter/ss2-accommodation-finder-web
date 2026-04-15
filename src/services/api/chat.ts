import apiClient from "../../lib/axios";
import type { ChatMessage, ChatResponse } from "../../types";

export const chatApi = {
  /**
   * Send a message to the AI chat service
   * @param message The chat message to send
   * @returns Promise resolving to the AI response
   */
  sendMessage: async (message: ChatMessage): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/api/ai-chat/message', message);
    return data;
  },

  /**
   * Check if the AI chat service is healthy
   * @returns Promise resolving to true if service is healthy
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      await apiClient.get('/api/ai-chat/health');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Test connection to the AI provider
   * @returns Promise resolving to connection test result
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const { data } = await apiClient.get<{ success: boolean; message: string }>('/ai-chat/test-connection');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
};