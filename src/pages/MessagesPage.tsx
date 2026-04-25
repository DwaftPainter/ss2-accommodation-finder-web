import { useState, useEffect } from "react";
import { Search, Settings, MessageSquare, ChevronDown } from "lucide-react";
import { chatApi, type Chat } from "../services/api/chat";
import { useAuth } from "../hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface MessagesPageProps {
    mode: "landlord" | "finder";
}

export default function MessagesPage({ mode }: MessagesPageProps) {
    const { user } = useAuth();
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

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <Search size={20} className="text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <Settings size={20} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => setFilter("all")}
                            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                filter === "all" 
                                ? "bg-gray-900 text-white" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Tất cả <ChevronDown size={14} />
                        </button>
                        <button 
                            onClick={() => setFilter("unread")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                filter === "unread" 
                                ? "bg-gray-900 text-white" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Chưa đọc
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center mt-10">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {filter === "unread" ? "Không có tin nhắn chưa đọc" : "Bạn không có tin nhắn nào"}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Khi bạn nhận được tin nhắn mới, tin nhắn đó sẽ xuất hiện ở đây.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredChats.map(chat => {
                                const otherUser = chat.user1Id === user?.id ? chat.user2 : chat.user1;
                                const lastMessage = chat.messages[0];
                                const isSelected = selectedChatId === chat.id;

                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => setSelectedChatId(chat.id)}
                                        className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
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
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedChatId ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        {/* Placeholder for actual chat component */}
                        <div className="text-center">
                            <p className="text-lg">Khu vực hội thoại</p>
                            <p className="text-sm">(Đang phát triển nội dung chi tiết)</p>
                        </div>
                    </div>
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
