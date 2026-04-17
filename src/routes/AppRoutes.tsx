import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import HomeRoute from "./HomeRoute";
import ExploreRoute from "./ExploreRoute";
import SavedRoute from "./SavedRoute";
import LoadingScreen from "./LoadingScreen";

export default function AppRoutes() {
    const { isLoading: auth0Loading } = useAuth0();

    if (auth0Loading) {
        return <LoadingScreen />;
    }

    return (
        <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/explore" element={<ExploreRoute />} />
            <Route path="/saved" element={<SavedRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
