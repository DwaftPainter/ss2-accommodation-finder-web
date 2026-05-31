import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore, useUser, useIsAuthenticated, useAuthLoading, useAuthError } from "../stores";

let hasValidatedSession = false;

/**
 * Hook for auth operations with auto-fetch on mount
 */
export function useAuth() {
    const user = useUser();
    const isAuthenticated = useIsAuthenticated();
    const isLoading = useAuthLoading();
    const error = useAuthError();
    
    // Select actions individually to ensure stability
    const login = useAuthStore(state => state.login);
    const register = useAuthStore(state => state.register);
    const logout = useAuthStore(state => state.logout);
    const logoutAll = useAuthStore(state => state.logoutAll);
    const fetchUser = useAuthStore(state => state.fetchUser);
    const validateSession = useAuthStore(state => state.validateSession);
    const verifyOtp = useAuthStore(state => state.verifyOtp);
    const resendOtp = useAuthStore(state => state.resendOtp);
    const refreshAccessToken = useAuthStore(state => state.refreshAccessToken);
    const clearError = useAuthStore(state => state.clearError);
    const updateProfile = useAuthStore(state => state.updateProfile);

    // Validate persisted auth state once per app mount.
    useEffect(() => {
        if (hasValidatedSession) return;
        hasValidatedSession = true;
        validateSession();
    }, [validateSession]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        logoutAll,
        fetchUser,
        validateSession,
        verifyOtp,
        resendOtp,
        refreshAccessToken,
        updateProfile,
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
                appState: {
                    returnTo: `${window.location.pathname}${window.location.search}`,
                },
                authorizationParams: {
                    connection: 'google-oauth2',
                },
            });
        }
    };

    return { requireAuth, isAuthenticated };
}
