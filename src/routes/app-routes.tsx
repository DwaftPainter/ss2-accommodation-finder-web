import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import publicRoutes from "./public-routes";
import privateRoutes from "./private-routes";

const routes = createBrowserRouter([
    ...publicRoutes,
    ...privateRoutes,
    { path: '*', element: <Navigate to="/" replace /> }
]);

const AppRoutes = () => {
    return <RouterProvider router={routes} />;
};

export default AppRoutes;
