import apiClient from "../../lib/axios";
import type { User } from "../../types";

export interface UpdateUserPayload {
    name?: string;
    avatarUrl?: string;
    phone?: string;
}

export interface SearchUsersParams {
    q?: string;
    role?: string;
    status?: string;
    emailVerified?: boolean;
    page?: number;
    limit?: number;
}

export interface SearchUsersResponse {
    data: User[];
    meta: { page: number; limit: number; total: number };
}

export const userApi = {
    /**
     * Get current user profile
     */
    getMe: async (): Promise<User> => {
        const { data } = await apiClient.get<User>("/api/users/me");
        return data;
    },

    /**
     * Update current user profile
     */
    updateMe: async (payload: UpdateUserPayload): Promise<User> => {
        const { data } = await apiClient.patch<User>("/api/users/me", payload);
        return data;
    },

    /**
     * Search users with backend OpenSearch fallback
     */
    search: async (params: SearchUsersParams = {}): Promise<SearchUsersResponse> => {
        const { emailVerified, ...rest } = params;
        const { data } = await apiClient.get<SearchUsersResponse>("/api/users/search", {
            params: {
                ...rest,
                ...(emailVerified !== undefined && { emailVerified: String(emailVerified) }),
            },
        });
        return data;
    }
};
