import apiClient from "../../lib/axios";
import type { User } from "../../types";

export const authApi = {
    /**
     * Get current user info
     */
    getMe: async (): Promise<User> => {
        const { data } = await apiClient.get<User>("/api/auth/me");
        return data;
    },

    /**
     * Login
     */
    login: async (): Promise<User> => {
        const { data } = await apiClient.get<User>("/api/auth/me");
        return data;
    },

    /**
     * Register
     */
    register: async (): Promise<User> => {
        const { data } = await apiClient.get<User>("/api/auth/register");
        return data;
    },

    /**
     * Get Google OAuth login URL
     */
    getLoginUrl: (): string => {
        return `${import.meta.env.VITE_API_URL || ""}/auth/google`;
    },

    /**
     * Login with Google OAuth
     */
    loginWithGoogle: (): void => {
        window.location.href = authApi.getLoginUrl();
    }
};
