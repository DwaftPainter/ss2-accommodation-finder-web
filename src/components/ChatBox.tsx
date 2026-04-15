import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare } from "lucide-react";

interface Message {
    id: number;
    text: string;
    sender: "bot" | "user";
    time: string;
}

const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const BOT_RESPONSES = [
    "Cảm ơn bạn đã liên hệ! Tôi có thể giúp gì cho bạn?",
    "Bạn đang tìm phòng trọ ở khu vực nào?",
    "Ngân sách của bạn khoảng bao nhiêu?",
    "Bạn có yêu cầu gì đặc biệt không? Ví dụ: có ban công, gần trường học, v.v.",
    "Tôi sẽ tìm kiếm và gợi ý cho bạn những phòng phù hợp nhất!",
    "Bạn có thể sử dụng bộ lọc trên bản đồ để tìm phòng nhanh hơn.",
];

export default function ChatBox() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Xin chào! Tôi là trợ lý ảo của AccomFinder. Bạn cần hỗ trợ gì?",
            sender: "bot",
            time: getTimeString(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const userMsg: Message = {
            id: Date.now(),
            text: trimmed,
            sender: "user",
            time: getTimeString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const botResponse = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
            const botMsg: Message = {
                id: Date.now() + 1,
                text: botResponse,
                sender: "bot",
                time: getTimeString(),
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 800 + Math.random() * 1200);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
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
                        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)",
                    }}
                    id="chatbox-window"
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-5 py-3.5"
                        style={{
                            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                        }}
                    >
                        <h3 className="text-white font-semibold text-[15px] tracking-wide">
                            Hỗ trợ trực tuyến
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
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
                            background: "linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)",
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

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                                        msg.sender === "user"
                                            ? "rounded-br-md"
                                            : "rounded-bl-md"
                                    }`}
                                    style={
                                        msg.sender === "user"
                                            ? {
                                                  background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                                                  color: "#fff",
                                              }
                                            : {
                                                  background: "#f0eeff",
                                                  color: "#1e1b4b",
                                              }
                                    }
                                >
                                    <p className="m-0">{msg.text}</p>
                                    <p
                                        className="text-[10px] mt-1 text-right"
                                        style={{
                                            opacity: 0.6,
                                            color: msg.sender === "user" ? "#e0e7ff" : "#6b7280",
                                        }}
                                    >
                                        {msg.time}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div
                                    className="rounded-2xl rounded-bl-md px-4 py-3 flex gap-1 items-center"
                                    style={{ background: "#f0eeff" }}
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
                        style={{
                            borderTop: "1px solid #eee",
                            background: "#fff",
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 text-[13.5px] px-4 py-2.5 rounded-full border-none outline-none"
                            style={{
                                background: "#f4f3ff",
                                color: "#1e1b4b",
                            }}
                            id="chatbox-input"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 shrink-0"
                            style={{
                                background: input.trim()
                                    ? "linear-gradient(135deg, #6366f1, #7c3aed)"
                                    : "#e0e0e0",
                                cursor: input.trim() ? "pointer" : "default",
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
                onClick={() => setIsOpen((prev) => !prev)}
                className="fixed bottom-5 left-5 z-[9999] flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                style={{
                    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                    boxShadow: "0 4px 20px rgba(99, 102, 241, 0.45)",
                }}
                id="chatbox-toggle-btn"
            >
                {isOpen ? (
                    <X size={22} color="#fff" />
                ) : (
                    <MessageSquare size={22} color="#fff" />
                )}
            </button>
        </>
    );
}
