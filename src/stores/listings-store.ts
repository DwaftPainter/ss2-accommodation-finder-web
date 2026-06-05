import { create } from "zustand";
import type { ListingSummary, ListingDetail, ListingFilters, SavedListing } from "../types";
import { listingsApi, savedApi } from "../services/api";

function matchesText(haystack: string | undefined, needle: string) {
    return haystack?.toLowerCase().includes(needle) ?? false;
}

function applyClientSideFilters(
    listings: ListingSummary[],
    filters: Partial<ListingFilters> = {}
) {
    const search = filters.search?.trim().toLowerCase();
    const priceMin = filters.price_min === undefined || filters.price_min === ""
        ? undefined
        : Number(filters.price_min);
    const priceMax = filters.price_max === undefined || filters.price_max === ""
        ? undefined
        : Number(filters.price_max);
    const areaMin = filters.area_min === undefined || filters.area_min === ""
        ? undefined
        : Number(filters.area_min);
    const areaMax = filters.area_max === undefined || filters.area_max === ""
        ? undefined
        : Number(filters.area_max);
    const utilities = filters.utilities?.filter(Boolean) ?? [];

    return listings.filter((listing) => {
        if (search) {
            const addressText = [
                listing.address.street,
                listing.address.ward,
                listing.address.district,
                listing.address.city,
                listing.address.province,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                matchesText(listing.title, search) ||
                matchesText(addressText, search) ||
                listing.utilities.some((utility) => utility.toLowerCase().includes(search));

            if (!matchesSearch) return false;
        }

        if (filters.province && listing.address.province !== filters.province) return false;
        if (filters.district && listing.address.district !== filters.district) return false;
        if (filters.ward && listing.address.ward !== filters.ward) return false;
        if (priceMin !== undefined && listing.price < priceMin) return false;
        if (priceMax !== undefined && listing.price > priceMax) return false;
        if (areaMin !== undefined && listing.area < areaMin) return false;
        if (areaMax !== undefined && listing.area > areaMax) return false;
        if (utilities.length > 0 && !utilities.every((utility) => listing.utilities.includes(utility))) {
            return false;
        }

        return true;
    });
}

interface ListingsState {
    // Data
    listings: ListingSummary[];
    currentListing: ListingDetail | null;
    savedListings: SavedListing[];
    savedListingIds: Set<string>;

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
    fetchMyListings: () => Promise<void>;

    // CRUD operations
    createListing: (data: Parameters<typeof listingsApi.create>[0]) => Promise<ListingDetail>;
    updateListing: (id: string, data: Parameters<typeof listingsApi.update>[1]) => Promise<ListingDetail>;
    deleteListing: (id: string) => Promise<void>;

    // Search operations
    searchByAddress: (address: string, radius?: number) => Promise<void>;
    searchNearby: (
        lat: number,
        lng: number,
        radius?: number,
        filters?: Partial<ListingFilters>
    ) => Promise<void>;

    // Saved operations
    toggleSaved: (listingId: string) => Promise<boolean>;
    isListingSaved: (listingId: string) => boolean;
    clearSavedListings: () => void;

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
    radius: undefined
};

const initialState: Omit<ListingsState, keyof ListingsActions> = {
    listings: [],
    currentListing: null,
    savedListings: [],
    savedListingIds: new Set(),
    filters: initialFilters,
    isLoading: false,
    isLoadingDetail: false,
    isLoadingSaved: false,
    error: null
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
                error: "Không thể tải danh sách chỗ ở."
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
                error: "Không thể tải thông tin tin đăng."
            });
        }
    },

    fetchSavedListings: async () => {
        set({ isLoadingSaved: true, error: null });
        try {
            const savedListings = await savedApi.getAll();
            set({
                savedListings,
                savedListingIds: new Set(savedListings.map((listing) => listing.id)),
                isLoadingSaved: false,
            });
        } catch (error) {
            const statusCode = (error as { statusCode?: number })?.statusCode;
            set({
                ...(statusCode === 401 ? { savedListings: [], savedListingIds: new Set<string>() } : {}),
                isLoadingSaved: false,
                error: "Không thể tải danh sách tin đã lưu."
            });
        }
    },

    fetchMyListings: async () => {
        set({ isLoading: true, error: null });
        try {
            const listings = await listingsApi.getMyListings();
            set({ listings, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: "Không thể tải danh sách bài đăng của bạn."
            });
        }
    },

    searchByAddress: async (address, radius = 5) => {
        set({ isLoading: true, error: null });
        try {
            const listings = await listingsApi.searchByAddress(address, radius);
            set({ listings, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: "Không thể tìm kiếm chỗ ở."
            });
        }
    },

    searchNearby: async (lat, lng, radius = 5, filters) => {
        set({ isLoading: true, error: null });
        try {
            const nearbyListings = await listingsApi.searchNearby(lat, lng, radius, filters);
            const listings = applyClientSideFilters(nearbyListings, filters);
            set({
                listings,
                filters: filters ? { ...get().filters, ...filters } : get().filters,
                isLoading: false,
            });
        } catch (error) {
            set({
                isLoading: false,
                error: "Không thể tìm chỗ ở gần vị trí này."
            });
        }
    },

    createListing: async (data) => {
        const listing = await listingsApi.create(data);
        set((state) => ({
            listings: [listing, ...state.listings]
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
            savedListingIds: new Set([...state.savedListingIds].filter((listingId) => listingId !== id)),
            currentListing: state.currentListing?.id === id ? null : state.currentListing
        }));
    },

    toggleSaved: async (listingId) => {
        const isCurrentlySaved = get().isListingSaved(listingId);
        const previousSavedListings = get().savedListings;
        const previousSavedListingIds = get().savedListingIds;
        const nextSavedListingIds = new Set(previousSavedListingIds);

        if (isCurrentlySaved) {
            nextSavedListingIds.delete(listingId);
        } else {
            nextSavedListingIds.add(listingId);
        }

        set((state) => ({
            savedListingIds: nextSavedListingIds,
            savedListings: isCurrentlySaved
                ? state.savedListings.filter((listing) => listing.id !== listingId)
                : state.savedListings,
            currentListing:
                state.currentListing?.id === listingId
                    ? { ...state.currentListing, isSaved: !isCurrentlySaved }
                    : state.currentListing,
            error: null,
        }));

        try {
            if (isCurrentlySaved) {
                await savedApi.unsave(listingId);
            } else {
                await savedApi.save(listingId);
            }

            await get().fetchSavedListings();
            return !isCurrentlySaved;
        } catch (error) {
            const statusCode = (error as { statusCode?: number })?.statusCode;
            const message = "Không thể cập nhật trạng thái lưu tin.";
            const isAlreadySaved = !isCurrentlySaved && statusCode === 409;
            const isAlreadyUnsaved = isCurrentlySaved && statusCode === 404;

            if (isAlreadySaved || isAlreadyUnsaved) {
                await get().fetchSavedListings();
                return !isCurrentlySaved;
            }

            set((state) => ({
                savedListings: previousSavedListings,
                savedListingIds: previousSavedListingIds,
                currentListing:
                    state.currentListing?.id === listingId
                        ? { ...state.currentListing, isSaved: isCurrentlySaved }
                        : state.currentListing,
                error: message,
            }));
            throw error;
        }
    },

    isListingSaved: (listingId) => {
        return get().savedListingIds.has(listingId);
    },

    clearSavedListings: () => {
        set((state) => ({
            savedListings: [],
            savedListingIds: new Set(),
            currentListing: state.currentListing
                ? { ...state.currentListing, isSaved: false }
                : state.currentListing,
        }));
    },

    setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters }
        }));
    },

    resetFilters: () => {
        set({ filters: initialFilters });
    },

    clearCurrentListing: () => {
        set({ currentListing: null });
    },

    clearError: () => set({ error: null })
}));

// Selector hooks
export const useListings = () => useListingsStore((state) => state.listings);
export const useCurrentListing = () => useListingsStore((state) => state.currentListing);
export const useSavedListings = () => useListingsStore((state) => state.savedListings);
export const useListingsFilters = () => useListingsStore((state) => state.filters);
