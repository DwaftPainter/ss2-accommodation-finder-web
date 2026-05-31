import { lazy, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "@/hooks/use-auth";
import { STORAGE_KEYS } from "@/lib/constants";
import LoadingScreen from "./loading-screen";
import LazyRoute from "./lazy-route";

const SavedRoute = lazy(() => import("./saved-route"));
const LandlordRoute = lazy(() => import("./landlord-route"));
const MessagesPage = lazy(() => import("@/pages/messages-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));

const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, isLoading, error } = useAuth();
    const { isAuthenticated: isAuth0Authenticated, isLoading: isAuth0Loading } = useAuth0();
    const hasStoredBackendToken = Boolean(
        localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
        localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    );
    const isPersistedStateWaitingForValidation = hasStoredBackendToken && !isAuthenticated && !error;
    const isInvalidPersistedState = isAuthenticated && !hasStoredBackendToken;

    if (
        isLoading ||
        isAuth0Loading ||
        isPersistedStateWaitingForValidation ||
        (isAuth0Authenticated && !isAuthenticated && !error)
    ) {
        return <LoadingScreen />;
    }

    return isAuthenticated && !isInvalidPersistedState ? children : <Navigate to="/" replace />;
};

const privateRoutes = [
    {
        path: '/saved',
        element: <PrivateRoute><LazyRoute component={SavedRoute} /></PrivateRoute>
    },
    {
        path: '/landlord',
        element: <PrivateRoute><LazyRoute component={LandlordRoute} /></PrivateRoute>
    },
    {
        path: '/landlord/chat',
        element: <PrivateRoute><LazyRoute component={MessagesPage} props={{ mode: "landlord" }} /></PrivateRoute>
    },
    {
        path: '/finder/chat',
        element: <PrivateRoute><LazyRoute component={MessagesPage} props={{ mode: "finder" }} /></PrivateRoute>
    },
    {
        path: '/profile',
        element: <PrivateRoute><LazyRoute component={ProfilePage} /></PrivateRoute>
    }
];

export default privateRoutes;
