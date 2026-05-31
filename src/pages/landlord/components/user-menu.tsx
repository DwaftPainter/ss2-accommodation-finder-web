import { useEffect, useRef, useState } from "react";
import { List, LogOut, Menu, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface UserMenuProps {
    user: { name?: string } | null;
    onNavigate?: (page: string) => void;
}

export function UserMenu({ user, onNavigate }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { logout } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSavedClick = () => {
        onNavigate?.("saved");
        setIsOpen(false);
    };

    const handleMessagesClick = () => {
        onNavigate?.("messages");
        setIsOpen(false);
    };

    const handleProfileClick = () => {
        onNavigate?.("profile");
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="flex items-center gap-2 border-l border-gray-200 pl-2 sm:gap-3 sm:pl-4">
            <button
                type="button"
                aria-label="Mở menu tài khoản"
                className="hidden rounded-full p-2 transition-colors hover:bg-gray-100 sm:block"
            >
                <Menu size={18} aria-hidden="true" />
            </button>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 p-1 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-medium text-white">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg" role="menu">
                        <button
                            type="button"
                            onClick={handleMessagesClick}
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                        >
                            <MessageSquare size={18} />
                            <span className="text-sm font-medium">Tin nhắn</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSavedClick}
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                        >
                            <List size={18} className="rotate-90" />
                            <span className="text-sm font-medium">Yêu thích đã lưu</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleProfileClick}
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                        >
                            <User size={18} />
                            <span className="text-sm font-medium">Hồ sơ</span>
                        </button>
                        <hr className="my-2 border-gray-200" />
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Đăng xuất</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
