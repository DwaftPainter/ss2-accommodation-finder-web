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
            await apiClient.get('/api/ai-chat/health');
            return true;
        } catch {
            return false;
        }
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
    getChatMessages: async (chatId: string, skip = 0, take = 20): Promise<{ messages: Message[], meta: any }> => {
        const { data } = await apiClient.get<{ messages: Message[], meta: any }>(`/api/chats/${chatId}/messages`, {
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
    }
};
