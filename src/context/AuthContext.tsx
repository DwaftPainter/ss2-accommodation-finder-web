import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');
        if (tokenFromUrl) {
            localStorage.setItem('token', tokenFromUrl);
            window.history.replaceState({}, '', window.location.pathname);
        }

        const token = localStorage.getItem('token');
        if (token) {
            authApi
                .getMe()
                .then(setUser)
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = () => {
        window.location.href = authApi.loginUrl();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
