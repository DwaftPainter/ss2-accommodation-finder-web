import { BrowserRouter } from "react-router-dom";
import { Auth0CallbackHandler } from "./components/auth";
import { AppRoutes } from "./routes";

export default function App() {
    return (
        <BrowserRouter>
            <Auth0CallbackHandler />
            <AppRoutes />
        </BrowserRouter>
    );
}
