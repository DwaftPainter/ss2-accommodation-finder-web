import { STORAGE_KEYS } from "@/lib/constants";
import { useAuthStore } from "@/stores";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";

let syncedAuth0Sub: string | null = null;
let auth0SyncPromise: Promise<void> | null = null;

export function Auth0CallbackHandler() {
    const { isAuthenticated, user } = useAuth0();
    const loginWithGoogleProfile = useAuthStore((state) => state.loginWithGoogleProfile);
    const hasSyncedRef = useRef(false);

    useEffect(() => {
        const syncAuth0User = async () => {
            if (hasSyncedRef.current) return;
            if (!isAuthenticated || !user) return;
            const hasBackendToken = Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
            if (syncedAuth0Sub === user.sub && hasBackendToken) return;

            hasSyncedRef.current = true;
            try {
                auth0SyncPromise ??= loginWithGoogleProfile({
                    ...user,
                    authProvider: "google"
                })
                    .then(() => {
                        syncedAuth0Sub = user.sub ?? null;
                    })
                    .finally(() => {
                        auth0SyncPromise = null;
                    });

                await auth0SyncPromise;
            } catch (error) {
                hasSyncedRef.current = false;
                syncedAuth0Sub = null;
                console.error("Failed to sync Auth0 user with backend:", error);
            }
        };

        syncAuth0User();
    }, [isAuthenticated, loginWithGoogleProfile, user]);

    useEffect(() => {
        if (!isAuthenticated) {
            hasSyncedRef.current = false;
            syncedAuth0Sub = null;
        }
    }, [isAuthenticated]);

    return null;
}
