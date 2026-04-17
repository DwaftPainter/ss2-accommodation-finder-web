import { useRef, useEffect } from "react";
import { X, Send, MessageSquare, AlertCircle } from "lucide-react";
import { useChatStore } from "@/stores/AIStore";
import { formatAddress } from "@/lib/utils";
import MarkdownMessage from "./MarkdownMessage";

export default function ChatBox() {
    const {
        isOpen,
        isTyping,
        input,
        error,
        messages,
        toggleOpen,
        setOpen,
        setInput,
        sendMessage,
        checkHealth
    } = useChatStore();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Inject CSS for typing indicator
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            .typing-dot {
                width: 8px;
                height: 8px;
                background-color: #10b981;
                border-radius: 50%;
                display: inline-block;
                margin: 0 2px;
                animation: typing 1.4s infinite ease-in-out;
            }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-5px); }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Check service health on mount
    useEffect(() => {
        checkHealth();
    }, [checkHealth]);

    // Scroll to bottom on new messages or typing indicator
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div
                    className="fixed bottom-20 left-4 z-[9999] w-[340px] rounded-2xl overflow-hidden shadow-2xl animate-chat-open"
                    style={{
                        background: "rgba(255, 255, 255, 0.97)",
                        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)"
                    }}
                    id="chatbox-window"
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-5 py-3.5"
                        style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
                    >
                        <h3 className="text-white font-semibold text-[15px] tracking-wide">
                            Hỗ trợ trực tuyến
                        </h3>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-white/80 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/10"
                            id="chatbox-close-btn"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        className="overflow-y-auto px-4 py-4 space-y-3"
                        style={{
                            height: "340px",
                            background: "linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)"
                        }}
                        id="chatbox-messages"
                    >
                        {/* Date label */}
                        <div className="flex justify-center mb-2">
                            <span
                                className="text-[11px] font-medium px-3 py-1 rounded-full"
                                style={{ background: "#eee", color: "#888" }}
                            >
                                Hôm nay
                            </span>
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 text-xs rounded-lg">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id}>
                                <div
                                    className={`flex ${
                                        msg.sender === "user" ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                                            msg.sender === "user" ? "rounded-br-md" : "rounded-bl-md"
                                        }`}
                                        style={
                                            msg.sender === "user"
                                                ? {
                                                      background: "linear-gradient(135deg, #10b981, #14b8a6)",
                                                      color: "#fff"
                                                  }
                                                : { background: "#ecfdf5", color: "#064e3b" }
                                        }
                                    >
                                        {msg.sender === "user" ? (
                                            <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
                                        ) : (
                                            <MarkdownMessage content={msg.text} />
                                        )}
                                        <p
                                            className="text-[10px] mt-1 text-right"
                                            style={{
                                                opacity: 0.6,
                                                color: msg.sender === "user" ? "#d1fae5" : "#6b7280"
                                            }}
                                        >
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>

                                {/* Related Listings */}
                                {msg.relatedListings && msg.relatedListings.length > 0 && (
                                    <div className="mt-2 ml-2">
                                        <p className="text-xs font-medium text-emerald-600 mb-1">
                                            Phòng gợi ý:
                                        </p>
                                        <div className="space-y-2">
                                            {msg.relatedListings.slice(0, 3).map((listing) => (
                                                <div
                                                    key={listing.id}
                                                    className="bg-white border border-gray-200 rounded-lg p-2 text-xs shadow-sm"
                                                >
                                                    <div className="font-medium text-gray-900 truncate">
                                                        {listing.title}
                                                    </div>
                                                    <div className="text-gray-600 truncate">
                                                        {listing.address ? formatAddress(listing.address) : "Chưa có địa chỉ"}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="font-semibold text-emerald-600">
                                                            {listing.price?.toLocaleString("vi-VN")}₫
                                                        </span>
                                                        <span className="text-gray-500">
                                                            {listing.area}m²
                                                        </span>
                                                    </div>
                                                    {listing.utilities && listing.utilities.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {listing.utilities
                                                                .slice(0, 3)
                                                                .map((util, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-xs"
                                                                    >
                                                                        {util}
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div
                                    className="rounded-2xl rounded-bl-md px-4 py-3 flex gap-1 items-center"
                                    style={{ background: "#ecfdf5" }}
                                >
                                    <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                                    <span className="typing-dot" style={{ animationDelay: "150ms" }} />
                                    <span className="typing-dot" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div
                        className="flex items-center gap-2 px-3 py-3"
                        style={{ borderTop: "1px solid #eee", background: "#fff" }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 text-[13.5px] px-4 py-2.5 rounded-full border-none outline-none"
                            style={{ background: "#f4f3ff", color: "#1e1b4b" }}
                            id="chatbox-input"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isTyping}
                            className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 shrink-0"
                            style={{
                                background:
                                    input.trim() && !isTyping
                                        ? "linear-gradient(135deg, #10b981, #14b8a6)"
                                        : "#e0e0e0",
                                cursor: input.trim() && !isTyping ? "pointer" : "default"
                            }}
                            id="chatbox-send-btn"
                        >
                            <Send size={16} color="#fff" />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={toggleOpen}
                className="fixed bottom-5 left-5 z-[9999] flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                style={{
                    background: "linear-gradient(135deg, #10b981, #14b8a6)",
                    boxShadow: "0 4px 20px rgba(16, 185, 129, 0.45)"
                }}
                id="chatbox-toggle-btn"
            >
                {isOpen ? <X size={22} color="#fff" /> : <MessageSquare size={22} color="#fff" />}
            </button>
        </>
    );
}
