import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RegisterPayload, User, LoginPayload } from "../types";
import { STORAGE_KEYS } from "../lib/constants";
import { authApi } from "../services/api";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    setUser: (user: User | null) => void;
    login: (payload: LoginPayload) => Promise<void>;
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;
    register: (payload: RegisterPayload) => Promise<{ message: string }>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    resendOtp: (email: string) => Promise<{ message: string }>;
    fetchUser: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
    handleAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>;
    clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
};

// Helper to store tokens
const storeTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

// Helper to clear tokens
const clearTokens = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },

            login: async (payload: LoginPayload) => {
                set({ isLoading: true, error: null });
                try {
                    const { user, accessToken, refreshToken } = await authApi.login(payload);
                    storeTokens(accessToken, refreshToken);
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    // Extract error message from Axios error with response data
                    let errorMessage = "Login failed";
                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }

                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage
                    });
                    throw error;
                }
            },

            register: async (payload: RegisterPayload) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await authApi.register(payload);
                    set({ isLoading: false });
                    return { message: result.message };
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : "Registration failed"
                    });
                    throw error;
                }
            },

            verifyOtp: async (email: string, otp: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { user, accessToken, refreshToken } = await authApi.verifyOtp({ email, otp });
                    storeTokens(accessToken, refreshToken);
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : "Verification failed"
                    });
                    throw error;
                }
            },

            resendOtp: async (email: string) => {
                const result = await authApi.resendOtp(email);
                return result;
            },

            logout: async () => {
                const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                try {
                    if (refreshToken) {
                        await authApi.logout(refreshToken);
                    }
                } finally {
                    clearTokens();
                    set({ ...initialState, isLoading: false });
                }
            },

            logoutAll: async () => {
                try {
                    await authApi.logoutAll();
                } finally {
                    clearTokens();
                    set({ ...initialState, isLoading: false });
                }
            },

            fetchUser: async () => {
                const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
                if (!token) {
                    set({ isLoading: false });
                    return;
                }

                set({ isLoading: true, error: null });
                try {
                    const user = await authApi.getMe();
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    clearTokens();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error instanceof Error ? error.message : "Failed to fetch user"
                    });
                }
            },

            refreshAccessToken: async () => {
                const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                if (!refreshToken) {
                    return false;
                }

                try {
                    const result = await authApi.refreshToken(refreshToken);
                    storeTokens(result.accessToken, result.refreshToken);
                    return true;
                } catch (error) {
                    clearTokens();
                    set({ user: null, isAuthenticated: false });
                    return false;
                }
            },

            handleAuthCallback: async (accessToken: string, refreshToken: string) => {
                storeTokens(accessToken, refreshToken);
                set({ isLoading: true, error: null });
                try {
                    const user = await authApi.getMe();
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    clearTokens();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error instanceof Error ? error.message : "Authentication failed"
                    });
                }
            },

            clearError: () => set({ error: null })
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
