import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import { Toaster } from 'sonner';
import './index.css';

// Auth0 configuration - replace with your actual credentials
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || '';
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
const AUTH0_REDIRECT_URI = window.location.origin;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Auth0Provider
            domain={AUTH0_DOMAIN}
            clientId={AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: AUTH0_REDIRECT_URI,
                connection: 'google-oauth2',
            }}
        >
            <App />
        </Auth0Provider>
        <Toaster
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
                style: {
                    background: '#1a1d27',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#f1f5f9',
                },
            }}
        />
    </React.StrictMode>
);
