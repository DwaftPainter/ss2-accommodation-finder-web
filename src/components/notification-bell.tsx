import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { notificationsApi } from "../services/api";
import type { Notification } from "../types";

interface NotificationBellProps {
    enabled: boolean;
}

export default function NotificationBell({ enabled }: NotificationBellProps) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const loadNotifications = async () => {
        if (!enabled) return;
        setLoading(true);
        try {
            const response = await notificationsApi.getAll({ limit: 5 });
            setItems(response.data);
            setUnreadCount(response.meta.unreadCount);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!enabled) {
            setItems([]);
            setUnreadCount(0);
            setOpen(false);
            return;
        }

        loadNotifications().catch(() => {});
    }, [enabled]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const toggleOpen = async () => {
        const nextOpen = !open;
        setOpen(nextOpen);
        if (nextOpen) {
            await loadNotifications().catch(() => {});
        }
    };

    const markAllAsRead = async () => {
        await notificationsApi.markAllAsRead();
        setUnreadCount(0);
        setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    };

    const markAsRead = async (notification: Notification) => {
        if (!notification.isRead) {
            await notificationsApi.markAsRead(notification.id);
            setUnreadCount((count) => Math.max(count - 1, 0));
            setItems((current) =>
                current.map((item) =>
                    item.id === notification.id ? { ...item, isRead: true } : item
                )
            );
        }
        setOpen(false);
    };

    if (!enabled) return null;

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={toggleOpen}
                className="relative flex items-center justify-center w-9 h-9 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Thông báo"
            >
                <Bell size={19} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-semibold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[1200]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                            >
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[0, 1, 2].map((item) => (
                                <div key={item} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                            Chưa có thông báo
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto">
                            {items.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => markAsRead(notification)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <span
                                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                                notification.isRead ? "bg-gray-200" : "bg-emerald-500"
                                            }`}
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                                {notification.body}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
