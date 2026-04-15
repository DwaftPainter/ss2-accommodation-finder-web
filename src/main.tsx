import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from 'sonner';
import './index.css';

// Initialize auth store on app start
import { useAuthStore } from './stores';

// Check for auth token in URL (OAuth callback)
const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get('token');
if (tokenFromUrl) {
    localStorage.setItem('token', tokenFromUrl);
    window.history.replaceState({}, '', window.location.pathname);
}

// Initialize auth state
useAuthStore.getState().fetchUser();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
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
