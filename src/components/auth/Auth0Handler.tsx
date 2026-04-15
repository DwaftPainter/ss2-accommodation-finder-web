import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";

export function Auth0CallbackHandler() {
    const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
    // Remove isStoreAuthenticated from here entirely
    const { handleAuthCallback } = useAuthStore();
    const hasSyncedRef = useRef(false);

    useEffect(() => {
        const syncAuth0User = async () => {
            if (hasSyncedRef.current) return; // only guard on ref, not store state
            if (!isAuthenticated || !user) return;

            hasSyncedRef.current = true; // set BEFORE the async call to prevent races
            try {
                const token = await getAccessTokenSilently();
                const response = await authApi.loginWithGoogle(token);
                // Use handleAuthCallback — it stores tokens AND fetches user
                await handleAuthCallback(response.accessToken, response.refreshToken);
            } catch (error) {
                hasSyncedRef.current = false; // allow retry on actual error
                console.error("Failed to sync Auth0 user with backend:", error);
            }
        };

        syncAuth0User();
    }, [isAuthenticated, user?.sub]); // removed getAccessTokenSilently, setUser, isStoreAuthenticated

    useEffect(() => {
        if (!isAuthenticated) {
            hasSyncedRef.current = false;
        }
    }, [isAuthenticated]);

    return null;
}
