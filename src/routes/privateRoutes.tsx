import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "./LoadingScreen";
import SavedRoute from "./SavedRoute";
import LandlordRoute from "./LandlordRoute";
import MessagesPage from "@/pages/MessagesPage";

const PrivateRoute = ({ element }: { element: React.ReactNode }) => {
    console.log("mount")
    const { isAuthenticated, isLoading } = useAuth();
    console.log('🚀 ~ PrivateRoute ~ isLoading:', isLoading)

    if (isLoading) {
        return <LoadingScreen />;
    }

    return isAuthenticated ? element : <Navigate to="/" />;
};

const privateRoutes = [
    {
        path: '/saved',
        element: <PrivateRoute element={<SavedRoute />} />
    },
    {
        path: '/landlord',
        element: <PrivateRoute element={<LandlordRoute />} />
    },
    {
        path: '/landlord/chat',
        element: <PrivateRoute element={<MessagesPage mode="landlord" />} />
    },
    {
        path: '/finder/chat',
        element: <PrivateRoute element={<MessagesPage mode="finder" />} />
    }
];

export default privateRoutes;
