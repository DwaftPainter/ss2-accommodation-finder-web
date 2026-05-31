import { lazy } from "react";
import LazyRoute from "./lazy-route";

const HomeRoute = lazy(() => import("./home-route"));

const publicRoutes = [
    { path: '/', element: <LazyRoute component={HomeRoute} /> }
];

export default publicRoutes;
