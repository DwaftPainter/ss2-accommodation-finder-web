import HomeRoute from "./HomeRoute";
import ExploreRoute from "./ExploreRoute";

const publicRoutes = [
    { path: '/', element: <HomeRoute /> },
    { path: '/explore', element: <ExploreRoute /> }
];

export default publicRoutes;
