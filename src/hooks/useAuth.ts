import { useEffect } from "react";
import {
    useAuthStore,
    useUser,
    useIsAuthenticated,
    useAuthLoading,
} from "../stores";

/**
 * Hook for auth operations with auto-fetch on mount
 */
export function useAuth() {
    const user = useUser();
    const isAuthenticated = useIsAuthenticated();
    const isLoading = useAuthLoading();
    const { login, logout, fetchUser, handleAuthCallback } =
        useAuthStore();

    // Auto-fetch user on mount if token exists
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        handleAuthCallback,
    };
}

/**
 * Hook to check if user is owner of a resource
 */
export function useIsOwner(ownerId: string) {
    const user = useUser();
    return user?.id === ownerId;
}

/**
 * Hook to require authentication for an action
 */
export function useRequireAuth() {
    const { isAuthenticated, login } = useAuth();

    const requireAuth = (callback: () => void) => {
        if (isAuthenticated) {
            callback();
        } else {
            login();
        }
    };

    return { requireAuth, isAuthenticated };
}
