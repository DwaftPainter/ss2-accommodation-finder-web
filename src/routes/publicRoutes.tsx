import { lazy } from "react";
import LazyRoute from "./LazyRoute";

const HomeRoute = lazy(() => import("./HomeRoute"));

const publicRoutes = [
    { path: '/', element: <LazyRoute component={HomeRoute} /> }
];

export default publicRoutes;
