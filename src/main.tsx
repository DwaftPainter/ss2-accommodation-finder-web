import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
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
        </AuthProvider>
    </React.StrictMode>
);
