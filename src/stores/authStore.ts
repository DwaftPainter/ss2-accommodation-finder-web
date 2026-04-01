import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types";
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
    login: () => void;
    logout: () => void;
    fetchUser: () => Promise<void>;
    handleAuthCallback: (token: string) => Promise<void>;
    clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },

            login: () => {
                authApi.loginWithGoogle();
            },

            logout: () => {
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                set({ ...initialState, isLoading: false });
            },

            fetchUser: async () => {
                const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
                if (!token) {
                    set({ isLoading: false });
                    return;
                }

                set({ isLoading: true, error: null });
                try {
                    const user = await authApi.getMe();
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    localStorage.removeItem(STORAGE_KEYS.TOKEN);
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Failed to fetch user",
                    });
                }
            },

            handleAuthCallback: async (token) => {
                localStorage.setItem(STORAGE_KEYS.TOKEN, token);
                set({ isLoading: true });
                try {
                    const user = await authApi.getMe();
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    localStorage.removeItem(STORAGE_KEYS.TOKEN);
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Authentication failed",
                    });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
    useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
