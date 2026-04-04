import { create } from "zustand";
import type {
    ListingSummary,
    ListingDetail,
    ListingFilters,
    SavedListing,
} from "../types";
import { listingsApi, savedApi } from "../services/api";

interface ListingsState {
    // Data
    listings: ListingSummary[];
    currentListing: ListingDetail | null;
    savedListings: SavedListing[];

    // Filters
    filters: ListingFilters;

    // Loading states
    isLoading: boolean;
    isLoadingDetail: boolean;
    isLoadingSaved: boolean;

    // Error
    error: string | null;
}

interface ListingsActions {
    // Data fetching
    fetchListings: (filters?: ListingFilters) => Promise<void>;
    fetchListingDetail: (id: string) => Promise<void>;
    fetchSavedListings: () => Promise<void>;

    // CRUD operations
    createListing: (
        data: Parameters<typeof listingsApi.create>[0]
    ) => Promise<ListingDetail>;
    updateListing: (
        id: string,
        data: Parameters<typeof listingsApi.update>[1]
    ) => Promise<ListingDetail>;
    deleteListing: (id: string) => Promise<void>;

    // Saved operations
    toggleSaved: (listingId: string) => Promise<boolean>;
    isListingSaved: (listingId: string) => boolean;

    // Filter operations
    setFilters: (filters: Partial<ListingFilters>) => void;
    resetFilters: () => void;
    clearCurrentListing: () => void;
    clearError: () => void;
}

type ListingsStore = ListingsState & ListingsActions;

const initialFilters: ListingFilters = {
    search: undefined,
    price_min: undefined,
    price_max: undefined,
    area_min: undefined,
    area_max: undefined,
    utilities: undefined,
    lat: undefined,
    lng: undefined,
    radius: undefined,
};

const initialState: Omit<
    ListingsState,
    keyof ListingsActions
> = {
    listings: [],
    currentListing: null,
    savedListings: [],
    filters: initialFilters,
    isLoading: false,
    isLoadingDetail: false,
    isLoadingSaved: false,
    error: null,
};

export const useListingsStore = create<ListingsStore>()((set, get) => ({
    ...initialState,

    fetchListings: async (filters = get().filters) => {
        set({ isLoading: true, error: null });
        try {
            const listings = await listingsApi.getAll(filters);
            set({ listings, filters, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch listings",
            });
        }
    },

    fetchListingDetail: async (id) => {
        set({ isLoadingDetail: true, error: null });
        try {
            const listing = await listingsApi.getById(id);
            set({ currentListing: listing, isLoadingDetail: false });
        } catch (error) {
            set({
                isLoadingDetail: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch listing details",
            });
        }
    },

    fetchSavedListings: async () => {
        set({ isLoadingSaved: true, error: null });
        try {
            const savedListings = await savedApi.getAll();
            set({ savedListings, isLoadingSaved: false });
        } catch (error) {
            set({
                isLoadingSaved: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch saved listings",
            });
        }
    },

    createListing: async (data) => {
        const listing = await listingsApi.create(data);
        set((state) => ({
            listings: [listing, ...state.listings],
        }));
        return listing;
    },

    updateListing: async (id, data) => {
        const listing = await listingsApi.update(id, data);
        set((state) => ({
            listings: state.listings.map((l) =>
                l.id === id ? { ...l, ...listing } : l
            ),
            currentListing:
                state.currentListing?.id === id
                    ? { ...state.currentListing, ...listing }
                    : state.currentListing,
        }));
        return listing;
    },

    deleteListing: async (id) => {
        await listingsApi.delete(id);
        set((state) => ({
            listings: state.listings.filter((l) => l.id !== id),
            savedListings: state.savedListings.filter((l) => l.id !== id),
            currentListing:
                state.currentListing?.id === id
                    ? null
                    : state.currentListing,
        }));
    },

    toggleSaved: async (listingId) => {
        try {
            const result = await savedApi.toggle(listingId);
            await get().fetchSavedListings();
            return result.saved;
        } catch (error) {
            console.error("Failed to toggle saved status:", error);
            return false;
        }
    },

    isListingSaved: (listingId) => {
        return get().savedListings.some((l) => l.id === listingId);
    },

    setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
        }));
    },

    resetFilters: () => {
        set({ filters: initialFilters });
    },

    clearCurrentListing: () => {
        set({ currentListing: null });
    },

    clearError: () => set({ error: null }),
}));

// Selector hooks
export const useListings = () =>
    useListingsStore((state) => state.listings);
export const useCurrentListing = () =>
    useListingsStore((state) => state.currentListing);
export const useSavedListings = () =>
    useListingsStore((state) => state.savedListings);
export const useListingsFilters = () =>
    useListingsStore((state) => state.filters);
