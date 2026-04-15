import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
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
    const { isAuthenticated: isAuth0Authenticated, user: auth0User } = useAuth0();
    const { login, register, logout, logoutAll, fetchUser, verifyOtp, resendOtp, refreshAccessToken, clearError } = useAuthStore();

    // Auto-fetch user on mount if token exists
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Sync Auth0 state with local auth store
    useEffect(() => {
        if (isAuth0Authenticated && auth0User) {
            // You can sync Auth0 user data with your backend here
            // or store it in your auth store
            console.log('Auth0 user authenticated:', auth0User);
        }
    }, [isAuth0Authenticated, auth0User]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
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
    const { isAuthenticated } = useAuth();
    const { loginWithRedirect } = useAuth0();

    const requireAuth = (callback: () => void) => {
        if (isAuthenticated) {
            callback();
        } else {
            onAuthRequired?.() ?? loginWithRedirect({
                authorizationParams: {
                    connection: 'google-oauth2',
                },
            });
        }
    };

    return { requireAuth, isAuthenticated };
}
