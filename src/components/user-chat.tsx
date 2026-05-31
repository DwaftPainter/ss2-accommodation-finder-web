import { useState, useEffect, useRef } from "react";
import { Send, X, User, Phone, Loader2 } from "lucide-react";
import { chatApi, type Message, type Chat } from "../services/api/chat";
import { useAuth } from "../hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { formatAddress } from "../lib/utils";
import { MapPinIcon } from "./ui";

interface UserChatProps {
    chatId: string;
    onClose?: () => void;
}

export default function UserChat({ chatId, onClose }: UserChatProps) {
    const { user } = useAuth();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchChatAndMessages = async () => {
        try {
            // In a real app, we might have a getChatById endpoint
            // For now, we get all chats and find the one we need
            const allChats = await chatApi.getUserChats();
            const foundChat = allChats.find(c => c.id === chatId);
            if (foundChat) {
                setChat(foundChat);
                const data = await chatApi.getChatMessages(chatId);
                setMessages(data.messages.reverse()); // Reverse to show oldest first
            }
        } catch (error) {
            console.error("Failed to fetch chat:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchChatAndMessages();

        // Polling for new messages (simple implementation for now)
        const interval = setInterval(fetchChatAndMessages, 5000);
        return () => clearInterval(interval);
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isSending) return;

        const messageContent = input.trim();
        setIsSending(true);
        try {
            const newMessage = await chatApi.sendMessage(chatId, messageContent);
            setMessages(prev => [...prev, newMessage]);
            setInput("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    if (loading && !chat) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!chat) return null;

    const otherUser = chat.user1Id === user?.id ? chat.user2 : chat.user1;

    return (
        <div className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                        <img 
                            src={otherUser.avatarUrl || "/logo.png"} 
                            alt={otherUser.name} 
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{otherUser.name}</h3>
                        <p className="text-xs text-gray-500">Đang hoạt động</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <Phone size={18} />
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Listing Info Strip */}
            {chat.listing && (
                <div className="px-3 sm:px-6 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white overflow-hidden flex-shrink-0 border border-emerald-200">
                        <img 
                            src={chat.listing.images?.[0] || "/listing-studio.png"} 
                            alt={chat.listing.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-emerald-900 truncate">{chat.listing.title}</h4>
                        <p className="text-[10px] text-emerald-700 flex items-center gap-0.5 truncate">
                            <MapPinIcon size={10} className="text-emerald-700" />
                            Xem tin liên quan
                        </p>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-gray-50/50">
                {messages.map((msg) => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div className="max-w-[86%] sm:max-w-[75%] group">
                                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                    isOwn 
                                    ? "bg-emerald-600 text-white rounded-br-none shadow-sm" 
                                    : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                                }`}>
                                    {msg.content}
                                </div>
                                <div className={`text-[10px] mt-1 text-gray-400 flex items-center gap-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: vi })}
                                    {isOwn && msg.isRead && <span>• Đã xem</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 sm:px-4 py-1 border border-gray-200 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/20 transition-all">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Nhập tin nhắn..." 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isSending}
                        className={`p-2 rounded-full transition-all ${
                            input.trim() && !isSending 
                            ? "bg-emerald-600 text-white shadow-md hover:scale-105" 
                            : "text-gray-400"
                        }`}
                    >
                        {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
