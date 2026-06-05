import { useState, useEffect } from "react";
import { ArrowLeft, Home, MessageSquare, ChevronDown, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { chatApi, type Chat } from "../../services/api/chat";
import { useAuth } from "../../hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import UserChat from "../../components/user-chat";
import { Button, EmptyState, LoadingState } from "@/components/ui";

interface MessagesPageProps {
    mode: "landlord" | "finder";
}

export default function MessagesPage({ mode }: MessagesPageProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        chatApi.getUserChats()
            .then(data => {
                // Filter chats based on mode if necessary
                // For now, just show all
                setChats(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [mode]);

    const filteredChats = chats.filter(chat => {
        if (filter === "unread") {
            return chat.messages.some(m => !m.isRead && m.senderId !== user?.id);
        }
        return true;
    });

    const handleSelectChat = (chatId: string) => {
        setSelectedChatId(chatId);
        setChats((currentChats) =>
            currentChats.map((chat) =>
                chat.id === chatId
                    ? {
                        ...chat,
                        messages: chat.messages.map((message) =>
                            message.senderId !== user?.id
                                ? { ...message, isRead: true }
                                : message
                        ),
                    }
                    : chat
            )
        );
    };

    const homePath = mode === "landlord" ? "/landlord" : "/";

    return (
        <div className="flex h-[100dvh] bg-white overflow-hidden">
            {/* Sidebar */}
            <div className={`${selectedChatId ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 border-r border-gray-200 flex-col min-w-0`}>
                <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 min-w-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => navigate(homePath)}
                                aria-label="Quay lại"
                            >
                                <ArrowLeft size={20} className="text-gray-600" />
                            </Button>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Tin nhắn</h1>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => navigate(homePath)}
                                aria-label={mode === "landlord" ? "Về trang chủ nhà" : "Về trang tìm phòng"}
                            >
                                <Home size={20} className="text-gray-600" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => navigate("/profile")}
                                aria-label="Hồ sơ"
                            >
                                <User size={20} className="text-gray-600" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <Button 
                            type="button"
                            onClick={() => setFilter("all")}
                            variant={filter === "all" ? "secondary" : "ghost"}
                            className="rounded-full"
                        >
                            Tất cả <ChevronDown size={14} />
                        </Button>
                        <Button 
                            type="button"
                            onClick={() => setFilter("unread")}
                            variant={filter === "unread" ? "secondary" : "ghost"}
                            className="rounded-full"
                        >
                            Chưa đọc
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <LoadingState title="Đang tải tin nhắn" className="py-10" />
                    ) : filteredChats.length === 0 ? (
                        <EmptyState
                            icon={MessageSquare}
                            title={filter === "unread" ? "Không có tin nhắn chưa đọc" : "Bạn không có tin nhắn nào"}
                            description="Khi bạn nhận được tin nhắn mới, tin nhắn đó sẽ xuất hiện ở đây."
                            className="mt-10"
                        />
                    ) : (
                        <div className="flex flex-col">
                            {filteredChats.map(chat => {
                                const otherUser = chat.user1Id === user?.id ? chat.user2 : chat.user1;
                                const lastMessage = chat.messages[0];
                                const isSelected = selectedChatId === chat.id;

                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => handleSelectChat(chat.id)}
                                        className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                                            isSelected ? "bg-gray-50" : ""
                                        }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img 
                                                src={otherUser.avatarUrl || "/logo.png"} 
                                                alt={otherUser.name} 
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            {lastMessage && !lastMessage.isRead && lastMessage.senderId !== user?.id && (
                                                <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="font-semibold text-gray-900 truncate">{otherUser.name}</h4>
                                                {lastMessage && (
                                                    <span className="text-xs text-gray-500">
                                                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false, locale: vi })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${
                                                lastMessage && !lastMessage.isRead && lastMessage.senderId !== user?.id 
                                                ? "text-gray-900 font-semibold" 
                                                : "text-gray-500"
                                            }`}>
                                                {lastMessage ? lastMessage.content : "Bắt đầu cuộc trò chuyện"}
                                            </p>
                                            {chat.listing && (
                                                <div className="mt-1 text-[11px] text-emerald-600 font-medium truncate">
                                                    Tin liên quan: {chat.listing.title}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${selectedChatId ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex-col bg-gray-50`}>
                {selectedChatId ? (
                    <UserChat chatId={selectedChatId} onClose={() => setSelectedChatId(null)} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                            <MessageSquare size={40} className="text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Chọn một cuộc trò chuyện</h2>
                        <p className="text-gray-500 max-w-xs">
                            Chọn từ danh sách bên trái để bắt đầu nhắn tin với chủ nhà hoặc khách thuê.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
