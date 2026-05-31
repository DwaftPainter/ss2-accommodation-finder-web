import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./app";
import { Toaster } from "sonner";
import "./index.css";
import env from "./config/env";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Auth0Provider
            domain={env.AUTH0_DOMAIN}
            clientId={env.AUTH0_CLIENT_ID}
            authorizationParams={{ redirect_uri: window.location.origin }}
        >
            <App />
        </Auth0Provider>
        <Toaster
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
                style: {
                    background: "#1a1d27",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#f1f5f9"
                }
            }}
        />
    </React.StrictMode>
);
