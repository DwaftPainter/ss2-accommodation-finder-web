import { create } from "zustand";

export type UserMode = "finder" | "landlord";

interface UIState {
    // Mode state - finder or landlord
    userMode: UserMode;

    // Modal states
    isAuthModalOpen: boolean;
    isCreateListingModalOpen: boolean;
    activeModalId: string | null;

    // Sidebar states
    isFilterPanelOpen: boolean;
    isSavedPanelOpen: boolean;

    // Toast/notification
    toast: {
        message: string;
        type: "success" | "error" | "info";
    } | null;
}

interface UIActions {
    // Mode actions
    setUserMode: (mode: UserMode) => void;
    toggleUserMode: () => void;

    // Modal actions
    openAuthModal: () => void;
    closeAuthModal: () => void;
    openCreateListingModal: () => void;
    closeCreateListingModal: () => void;
    setActiveModalId: (id: string | null) => void;

    // Sidebar actions
    toggleFilterPanel: () => void;
    setFilterPanelOpen: (open: boolean) => void;
    toggleSavedPanel: () => void;
    setSavedPanelOpen: (open: boolean) => void;

    // Toast actions
    showToast: (
        message: string,
        type?: "success" | "error" | "info"
    ) => void;
    clearToast: () => void;

    // Reset all
    resetUI: () => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
    userMode: "finder",
    isAuthModalOpen: false,
    isCreateListingModalOpen: false,
    activeModalId: null,
    isFilterPanelOpen: false,
    isSavedPanelOpen: false,
    toast: null,
};

export const useUIStore = create<UIStore>()((set) => ({
    ...initialState,

    setUserMode: (mode) => set({ userMode: mode }),
    toggleUserMode: () => set((state) => ({
        userMode: state.userMode === "finder" ? "landlord" : "finder",
    })),

    openAuthModal: () => set({ isAuthModalOpen: true }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),

    openCreateListingModal: () =>
        set({ isCreateListingModalOpen: true }),
    closeCreateListingModal: () =>
        set({ isCreateListingModalOpen: false }),

    setActiveModalId: (id) => set({ activeModalId: id }),

    toggleFilterPanel: () =>
        set((state) => ({
            isFilterPanelOpen: !state.isFilterPanelOpen,
        })),
    setFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),

    toggleSavedPanel: () =>
        set((state) => ({
            isSavedPanelOpen: !state.isSavedPanelOpen,
        })),
    setSavedPanelOpen: (open) => set({ isSavedPanelOpen: open }),

    showToast: (message, type = "info") =>
        set({ toast: { message, type } }),
    clearToast: () => set({ toast: null }),

    resetUI: () => set(initialState),
}));

// Selector hooks
export const useUserMode = () => useUIStore((state) => state.userMode);
export const useAuthModalOpen = () =>
    useUIStore((state) => state.isAuthModalOpen);
export const useCreateListingModalOpen = () =>
    useUIStore((state) => state.isCreateListingModalOpen);
export const useToast = () => useUIStore((state) => state.toast);
