import { useState } from "react";
import { Filter, Bookmark, LogIn, X, SwitchCamera, Map } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUserMode, type UserMode } from "../stores";

interface NavbarProps {
    onOpenSaved: () => void;
    onToggleFilters: () => void;
    showFilters: boolean;
    onOpenAuth: () => void;
    onSearch: (query: string) => void;
    onToggleMode?: () => void;
    showMap?: boolean;
    onToggleMap?: () => void;
}

export default function Navbar({
    onOpenSaved,
    onToggleFilters,
    showFilters,
    onOpenAuth,
    onSearch,
    onToggleMode,
    showMap,
    onToggleMap
}: NavbarProps) {
    const { user, isLoading: loading, logout } = useAuth();
    const userMode = useUserMode();
    const [query, setQuery] = useState("");

    const modeButtonText = userMode === "finder" ? "Cho thuê phòng" : "Tìm phòng";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleClear = () => {
        setQuery("");
        onSearch("");
    };

    return (
        <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5 z-1000 shadow-sm">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
                <span className="text-xl font-extrabold italic tracking-tight text-slate-900 hidden sm:inline">
                    AccomFinder
                </span>
            </div>
            {/* Map Toggle Button - only in finder mode */}
            {userMode === "finder" && onToggleMap && (
                <div className="flex-1 mx-4 max-w-md hidden sm:flex items-center justify-center">
                    <button
                        onClick={onToggleMap}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all border
                            ${
                                showMap
                                    ? "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
                                    : "bg-[#222222] text-white border-transparent hover:bg-black shadow-md"
                            }`}
                    >
                        {showMap ? (
                            <>
                                <span>Ẩn bản đồ</span>
                                <X size={16} />
                            </>
                        ) : (
                            <>
                                <span>Hiện bản đồ</span>
                                <Map size={16} />
                            </>
                        )}
                    </button>
                </div>
            )}
            {userMode !== "finder" && <div className="flex-1" />} {/* Spacer for landlord mode */}
            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Mode toggle button - Airbnb style */}
                <button
                    onClick={onToggleMode}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent whitespace-nowrap"
                    id="toggle-mode-btn"
                >
                    <span className="hidden sm:inline">{modeButtonText}</span>
                    <span className="sm:hidden">
                        <SwitchCamera size={18} />
                    </span>
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-slate-200 mx-1" />

                <button
                    onClick={onToggleFilters}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${
                showFilters
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
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
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
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
