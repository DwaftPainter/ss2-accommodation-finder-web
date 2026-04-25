import { useState } from "react";
import { Filter, Bookmark, LogIn, X, SwitchCamera, Map, Menu, MessageSquare } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUserMode } from "../stores";

interface NavbarProps {
    onOpenSaved: () => void;
    onOpenMessages?: () => void;
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
    onOpenMessages,
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const modeButtonText = userMode === "finder" ? "Cho thuê phòng" : "Tìm phòng";

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <>
            <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-5 z-[1000] shadow-sm relative">
                {/* Brand */}
                <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-extrabold italic tracking-tight text-slate-900">
                        AccomFinder
                    </span>
                </div>

                {/* Desktop: Map Toggle Button - only in finder mode */}
                {userMode === "finder" && onToggleMap && (
                    <div className="hidden md:flex flex-1 mx-4 max-w-md items-center justify-center">
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
                {userMode !== "finder" && <div className="flex-1 hidden md:block" />}

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Mode toggle button */}
                    <button
                        onClick={onToggleMode}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent whitespace-nowrap"
                        id="toggle-mode-btn"
                    >
                        {modeButtonText}
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
                        <span>Bộ lọc</span>
                    </button>

                    {user && (
                        <>
                            <button
                                onClick={onOpenSaved}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent"
                                id="saved-btn"
                            >
                                <Bookmark size={16} />
                                <span>Đã lưu</span>
                            </button>
                            <button
                                onClick={onOpenMessages}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent"
                                id="messages-btn"
                            >
                                <MessageSquare size={16} />
                                <span>Tin nhắn</span>
                            </button>
                        </>
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

                {/* Mobile: Menu Button */}
                <div className="flex md:hidden items-center gap-2">
                    {/* Mobile Map Toggle - only in finder mode */}
                    {userMode === "finder" && onToggleMap && (
                        <button
                            onClick={onToggleMap}
                            className={`p-2 rounded-lg transition-all ${
                                showMap ? "bg-emerald-50 text-emerald-600" : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <Map size={20} />
                        </button>
                    )}

                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[1001] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeMobileMenu}
                    />

                    {/* Menu Panel */}
                    <div className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <span className="text-lg font-bold text-slate-900">Menu</span>
                            <button
                                onClick={closeMobileMenu}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto py-4">
                            {/* Mode Toggle */}
                            <button
                                onClick={() => {
                                    onToggleMode?.();
                                    closeMobileMenu();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-all"
                            >
                                <SwitchCamera size={20} />
                                <span className="font-medium">{modeButtonText}</span>
                            </button>

                            {/* Divider */}
                            <div className="my-2 border-t border-slate-200" />

                            {/* Filters */}
                            <button
                                onClick={() => {
                                    onToggleFilters();
                                    closeMobileMenu();
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                                    showFilters ? "text-emerald-600 bg-emerald-50" : "text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                <Filter size={20} />
                                <span className="font-medium">Bộ lọc</span>
                            </button>

                            {/* Saved & Messages */}
                            {user && (
                                <>
                                    <button
                                        onClick={() => {
                                            onOpenSaved();
                                            closeMobileMenu();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-all"
                                    >
                                        <Bookmark size={20} />
                                        <span className="font-medium">Đã lưu</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            onOpenMessages?.();
                                            closeMobileMenu();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-all"
                                    >
                                        <MessageSquare size={20} />
                                        <span className="font-medium">Tin nhắn</span>
                                    </button>
                                </>
                            )}

                            {/* Divider */}
                            <div className="my-2 border-t border-slate-200" />

                            {/* Auth Section */}
                            {loading ? (
                                <div className="px-4 py-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                                </div>
                            ) : user ? (
                                <>
                                    <div className="px-4 py-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-semibold text-white overflow-hidden">
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
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{user.name}</span>
                                            <span className="text-xs text-slate-500">Đã đăng nhập</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            closeMobileMenu();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        <LogIn size={20} />
                                        <span className="font-medium">Đăng xuất</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        onOpenAuth();
                                        closeMobileMenu();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-emerald-600 hover:bg-emerald-50 transition-all"
                                >
                                    <LogIn size={20} />
                                    <span className="font-medium">Đăng nhập</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
