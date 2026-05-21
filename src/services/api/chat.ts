import apiClient from "../../lib/axios";
import type { ChatMessage, ChatResponse } from "../../types";

export interface Chat {
    id: string;
    user1Id: string;
    user2Id: string;
    listingId?: string;
    user1: { id: string; name: string; avatarUrl: string | null };
    user2: { id: string; name: string; avatarUrl: string | null };
    listing?: { id: string; title: string; images: string[] };
    messages: {
        id: string;
        content: string;
        createdAt: string;
        senderId: string;
        isRead: boolean;
    }[];
    updatedAt: string;
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    sender: { id: string; name: string; avatarUrl: string | null };
}

export interface ChatMessagesResponse {
    messages: Message[];
    meta: { skip?: number; take?: number; total?: number; page?: number; limit?: number };
}

export interface AiHealthResponse {
    status: string;
    provider?: string;
    model?: string;
}

export interface AiConnectionResponse {
    connected: boolean;
    provider?: string;
    model?: string;
}

export const chatApi = {
    /**
     * AI Chat - Send a message to the AI chat service
     */
    sendAIMessage: async (message: ChatMessage): Promise<ChatResponse> => {
        const { data } = await apiClient.post<ChatResponse>('/api/ai-chat/message', message);
        return data;
    },

    /**
     * AI Chat - Check if the AI service is available
     */
    healthCheck: async (): Promise<boolean> => {
        try {
            await chatApi.getAIHealth();
            return true;
        } catch {
            return false;
        }
    },

    /**
     * AI Chat - Get provider/model health details
     */
    getAIHealth: async (): Promise<AiHealthResponse> => {
        const { data } = await apiClient.get<AiHealthResponse>('/api/ai-chat/health');
        return data;
    },

    /**
     * AI Chat - Test provider connectivity
     */
    testAIConnection: async (): Promise<AiConnectionResponse> => {
        const { data } = await apiClient.get<AiConnectionResponse>('/api/ai-chat/test-connection');
        return data;
    },

    /**
     * User Chat - Get all user chats
     */
    getUserChats: async (): Promise<Chat[]> => {
        const { data } = await apiClient.get<Chat[]>('/api/chats');
        return data;
    },

    /**
     * User Chat - Get messages for a specific chat
     */
    getChatMessages: async (chatId: string, skip = 0, take = 20): Promise<ChatMessagesResponse> => {
        const { data } = await apiClient.get<ChatMessagesResponse>(`/api/chats/${chatId}/messages`, {
            params: { skip, take }
        });
        return data;
    },

    /**
     * User Chat - Create or get a chat with another user
     */
    createChat: async (userId: string, listingId?: string): Promise<Chat> => {
        const { data } = await apiClient.post<Chat>('/api/chats', { userId, listingId });
        return data;
    },

    /**
     * User Chat - Get total unread count
     */
    getUnreadCount: async (): Promise<{ count: number }> => {
        const { data } = await apiClient.get<{ count: number }>('/api/chats/unread/count');
        return data;
    },

    /**
     * User Chat - Send a message to a chat
     */
    sendMessage: async (chatId: string, content: string): Promise<Message> => {
        const { data } = await apiClient.post<Message>(`/api/chats/${chatId}/messages`, { content });
        return data;
    },

    /**
     * User Chat - Search messages through backend OpenSearch fallback
     */
    searchMessages: async (
        query: string,
        params: { chatId?: string; page?: number; limit?: number } = {}
    ): Promise<ChatMessagesResponse> => {
        const { data } = await apiClient.get<ChatMessagesResponse>('/api/chats/search', {
            params: { q: query, ...params }
        });
        return data;
    },

    /**
     * User Chat - Get chat history through backend OpenSearch fallback
     */
    getChatHistory: async (
        chatId: string,
        page = 1,
        limit = 50
    ): Promise<ChatMessagesResponse> => {
        const { data } = await apiClient.get<ChatMessagesResponse>(`/api/chats/${chatId}/history`, {
            params: { page, limit }
        });
        return data;
    }
};
