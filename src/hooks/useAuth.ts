import { useEffect } from "react";
import { useAuthStore, useUser, useIsAuthenticated, useAuthLoading, useAuthError } from "../stores";
import type { LoginPayload, RegisterPayload } from "../types";

/**
 * Hook for auth operations with auto-fetch on mount
 */
export function useAuth() {
    const user = useUser();
    const isAuthenticated = useIsAuthenticated();
    const isLoading = useAuthLoading();
    const error = useAuthError();
    const { login, loginWithGoogle, register, logout, logoutAll, fetchUser, verifyOtp, resendOtp, refreshAccessToken, clearError } = useAuthStore();

    // Auto-fetch user on mount if token exists
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        loginWithGoogle,
        register,
        logout,
        logoutAll,
        verifyOtp,
        resendOtp,
        refreshAccessToken,
        clearError
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
export function useRequireAuth(onAuthRequired?: () => void) {
    const { isAuthenticated, loginWithGoogle } = useAuth();

    const requireAuth = (callback: () => void) => {
        if (isAuthenticated) {
            callback();
        } else {
            onAuthRequired?.() ?? loginWithGoogle();
        }
    };

    return { requireAuth, isAuthenticated };
}
