import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore, useUser, useIsAuthenticated, useAuthLoading, useAuthError } from "../stores";

/**
 * Hook for auth operations with auto-fetch on mount
 */
export function useAuth() {
    const user = useUser();
    const isAuthenticated = useIsAuthenticated();
    const isLoading = useAuthLoading();
    const error = useAuthError();
    const { isAuthenticated: isAuth0Authenticated, user: auth0User } = useAuth0();
    
    // Select actions individually to ensure stability
    const login = useAuthStore(state => state.login);
    const register = useAuthStore(state => state.register);
    const logout = useAuthStore(state => state.logout);
    const logoutAll = useAuthStore(state => state.logoutAll);
    const fetchUser = useAuthStore(state => state.fetchUser);
    const verifyOtp = useAuthStore(state => state.verifyOtp);
    const resendOtp = useAuthStore(state => state.resendOtp);
    const refreshAccessToken = useAuthStore(state => state.refreshAccessToken);
    const clearError = useAuthStore(state => state.clearError);

    // Auto-fetch user on mount if token exists
    useEffect(() => {
        // Only fetch if not already authenticated to avoid loops
        const token = localStorage.getItem('access_token');
        if (token && !user) {
            fetchUser();
        }
    }, [fetchUser, !!user]);

    // Sync Auth0 state with local auth store
    useEffect(() => {
        if (isAuth0Authenticated && auth0User) {
            // Optional: Sync logic if needed
            console.log('Auth0 user authenticated:', auth0User.sub);
        }
    }, [isAuth0Authenticated, auth0User?.sub]);

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
