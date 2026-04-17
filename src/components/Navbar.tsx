import { useState } from 'react';
import { Home, Filter, Bookmark, LogIn, Search, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
    onOpenSaved: () => void;
    onToggleFilters: () => void;
    showFilters: boolean;
    onOpenAuth: () => void;
    onSearch: (query: string) => void;
}

export default function Navbar({ onOpenSaved, onToggleFilters, showFilters, onOpenAuth, onSearch }: NavbarProps) {
    const { user, isLoading: loading, logout } = useAuth();
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5 z-[1000] shadow-sm">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
                <span className="text-xl font-extrabold italic tracking-tight text-slate-900 hidden sm:inline">
                    AccomFinder
                </span>
            </div>

            {/* Search Bar */}
            <form
                onSubmit={handleSubmit}
                className="flex-1 mx-4 max-w-md hidden sm:flex items-center relative"
            >
                <Search
                    size={15}
                    className="absolute left-3 text-slate-500 pointer-events-none"
                />
                <input
                    type="text"
                    id="navbar-search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm địa chỉ, quận, phường..."
                    className="w-full pl-9 pr-8 py-2 rounded-lg text-sm text-slate-900 placeholder-slate-400 transition-all focus:outline-none"
                    style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                    }}
                    onFocus={e => {
                        e.currentTarget.style.border = '1px solid rgba(16,185,129,0.6)';
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)';
                    }}
                    onBlur={e => {
                        e.currentTarget.style.border = '1px solid #e2e8f0';
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2.5 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleFilters}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${showFilters
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                        }`}
                    id="toggle-filters-btn"
                >
                    <Filter size={16} />
                    <span className="hidden sm:inline">Bộ lọc</span>
                </button>

                {user && (
                    <button
                        onClick={onOpenSaved}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent"
                        id="saved-btn"
                    >
                        <Bookmark size={16} />
                        <span className="hidden sm:inline">Đã lưu</span>
                    </button>
                )}

                {loading ? (
                    <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                ) : user ? (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-semibold text-white overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.name?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        <button
                            onClick={logout}
                            className="text-xs px-2.5 py-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
                            id="logout-btn"
                        >
                            Đăng xuất
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onOpenAuth}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm transition-all"
                        id="login-btn"
                    >
                        <LogIn size={14} />
                        Đăng nhập
                    </button>
                )}
            </div>
        </nav>
    );
}
