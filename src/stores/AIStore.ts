import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { chatApi } from "../services/api";
import type { ListingSummary } from "../types";

export interface Message {
    id: number;
    text: string;
    sender: "bot" | "user";
    time: string;
    relatedListings?: Partial<ListingSummary>[];
}

interface ChatState {
    // UI State
    isOpen: boolean;
    isTyping: boolean;
    input: string;
    error: string | null;

    // Chat State
    messages: Message[];
    sessionId: string | null;
    isServiceAvailable: boolean;

    // Actions
    toggleOpen: () => void;
    setOpen: (open: boolean) => void;
    setInput: (input: string) => void;
    clearError: () => void;
    sendMessage: () => Promise<void>;
    checkHealth: () => Promise<void>;
    resetSession: () => void;
}

const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const INITIAL_BOT_MESSAGE: Message = {
    id: 1,
    text: "Xin chào! Tôi là trợ lý ảo của AccomFinder. Tôi có thể giúp bạn tìm phòng trọ phù hợp dựa trên ngân sách, vị trí và các tiện ích bạn cần. Hãy nói với tôi bạn đang tìm phòng như thế nào?",
    sender: "bot",
    time: getTimeString()
};

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            // UI State
            isOpen: false,
            isTyping: false,
            input: "",
            error: null,

            // Chat State
            messages: [INITIAL_BOT_MESSAGE],
            sessionId: null,
            isServiceAvailable: true,

            // Actions
            toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

            setOpen: (open) => set({ isOpen: open }),

            setInput: (input) => set({ input }),

            clearError: () => set({ error: null }),

            checkHealth: async () => {
                try {
                    const isConnected = await chatApi.healthCheck();
                    set({
                        isServiceAvailable: isConnected,
                        error: isConnected ? null : "Dịch vụ hỗ trợ đang bảo trì. Vui lòng thử lại sau."
                    });
                } catch {
                    set({
                        isServiceAvailable: false,
                        error: "Không thể kết nối đến dịch vụ hỗ trợ. Vui lòng kiểm tra kết nối mạng."
                    });
                }
            },

            sendMessage: async () => {
                const { input, sessionId } = get();
                const trimmed = input.trim();
                if (!trimmed) return;

                const userMsg: Message = {
                    id: Date.now(),
                    text: trimmed,
                    sender: "user",
                    time: getTimeString()
                };

                set((state) => ({
                    messages: [...state.messages, userMsg],
                    input: "",
                    isTyping: true,
                    error: null
                }));

                try {
                    const response = await chatApi.sendMessage({
                        content: trimmed,
                        role: "user",
                        sessionId: sessionId || undefined
                    });

                    const botMsg: Message = {
                        id: Date.now() + 1,
                        text: response.content,
                        sender: "bot",
                        time: getTimeString(),
                        relatedListings: response.relatedListings
                    };

                    set((state) => ({
                        messages: [...state.messages, botMsg],
                        sessionId: response.sessionId ?? state.sessionId
                    }));
                } catch (err) {
                    console.error("Chat error:", err);

                    const errorMsg: Message = {
                        id: Date.now() + 1,
                        text: "Xin lỗi, tôi không thể kết nối được lúc này. Vui lòng thử lại sau.",
                        sender: "bot",
                        time: getTimeString()
                    };

                    set((state) => ({
                        messages: [...state.messages, errorMsg],
                        error: "Xin lỗi, tôi không thể kết nối được lúc này. Vui lòng thử lại sau."
                    }));
                } finally {
                    set({ isTyping: false });
                }
            },

            resetSession: () =>
                set({
                    messages: [INITIAL_BOT_MESSAGE],
                    sessionId: null,
                    error: null,
                    input: ""
                })
        }),
        {
            name: "accomfinder-chat",
            storage: createJSONStorage(() => sessionStorage),
            // Only persist chat history and session, not UI state
            partialize: (state) => ({
                messages: state.messages,
                sessionId: state.sessionId
            })
        }
    )
);
