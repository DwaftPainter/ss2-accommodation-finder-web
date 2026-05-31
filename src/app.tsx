import { Auth0CallbackHandler } from "./components/auth";
import { AppRoutes } from "./routes";

export default function App() {
    return (
        <>
            <Auth0CallbackHandler />
            <AppRoutes />
        </>
    );
}
