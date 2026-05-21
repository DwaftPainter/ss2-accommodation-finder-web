import apiClient from "../../lib/axios";
import type { Notification, NotificationsResponse } from "../../types";

export interface NotificationsParams {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}

export const notificationsApi = {
    getAll: async (params: NotificationsParams = {}): Promise<NotificationsResponse> => {
        const { unreadOnly, ...rest } = params;
        const { data } = await apiClient.get<NotificationsResponse>("/api/notifications", {
            params: {
                ...rest,
                ...(unreadOnly !== undefined && { unreadOnly: String(unreadOnly) }),
            },
        });
        return data;
    },

    getUnreadCount: async (): Promise<number> => {
        const { data } = await apiClient.get<{ count: number }>("/api/notifications/unread-count");
        return data.count;
    },

    markAsRead: async (id: string): Promise<Notification> => {
        const { data } = await apiClient.patch<Notification>(`/api/notifications/${id}/read`);
        return data;
    },

    markAllAsRead: async (): Promise<{ updated: number }> => {
        const { data } = await apiClient.patch<{ updated: number }>("/api/notifications/read-all");
        return data;
    },
};
