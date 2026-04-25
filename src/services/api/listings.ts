import apiClient from "../../lib/axios";
import type {
    ListingSummary,
    ListingDetail,
    ListingPayload,
    ListingFilters,
} from "../../types";

/**
 * Build query string from filters
 * Maps snake_case frontend filters to camelCase backend params
 */
function buildQueryString(
    params: ListingFilters
): string {
    const query = new URLSearchParams();

    // Map snake_case to camelCase for backend
    const keyMapping: Record<string, string> = {
        price_min: "minPrice",
        price_max: "maxPrice",
        area_min: "minArea",
        area_max: "maxArea",
    };

    Object.entries(params).forEach(([key, val]) => {
        if (val === undefined || val === null || val === "") return;

        const backendKey = keyMapping[key] || key;

        if (key === "utilities" && Array.isArray(val)) {
            if (val.length > 0) {
                query.set(backendKey, val.join(","));
            }
        } else if (Array.isArray(val)) {
            val.forEach((v) => query.append(backendKey, String(v)));
        } else {
            query.set(backendKey, String(val));
        }
    });

    const qs = query.toString();
    return qs ? `?${qs}` : "";
}

export const listingsApi = {
    /**
     * Get all listings with filters
     * Backend returns { data, meta } - we extract just the data array
     */
    getAll: async (
        filters: ListingFilters = {}
    ): Promise<ListingSummary[]> => {
        const query = buildQueryString(filters);
        const { data } = await apiClient.get<{
            data: ListingSummary[];
            meta: { page: number; limit: number; total: number };
        }>(`/api/listings${query}`);
        return data.data;
    },

    /**
     * Get single listing by ID
     */
    getById: async (id: string): Promise<ListingDetail> => {
        const { data } = await apiClient.get<ListingDetail>(
            `/api/listings/${id}`
        );
        return data;
    },

    /**
     * Create new listing
     */
    create: async (formData: ListingPayload): Promise<ListingDetail> => {
        const { data } = await apiClient.post<ListingDetail>(
            "/api/listings",
            formData
        );
        return data;
    },

    /**
     * Update listing - uses PATCH to match backend
     */
    update: async (
        id: string,
        formData: Partial<ListingPayload>
    ): Promise<ListingDetail> => {
        const { data } = await apiClient.patch<ListingDetail>(
            `/api/listings/${id}`,
            formData
        );
        return data;
    },

    /**
     * Delete listing
     */
    delete: async (id: string): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(
            `/api/listings/${id}`
        );
        return data;
    },

    /**
     * Search listings by address (geocodes address first)
     * Returns { location, listings }
     */
    searchByAddress: async (address: string, radius: number = 5): Promise<ListingSummary[]> => {
        const response = await apiClient.get<{
            location: { lat: number; lng: number };
            listings: ListingSummary[];
        }>("/api/listings/search/by-address", { params: { address, radius } });
        return response.data.listings;
    },

    /**
     * Search listings near coordinates
     */
    searchNearby: async (lat: number, lng: number, radius: number = 5): Promise<ListingSummary[]> => {
        const response = await apiClient.get<ListingSummary[]>(
            "/api/listings/search/nearby",
            { params: { lat, lng, radius } }
        );
        return response.data;
    },

    /**
     * Geocode address to coordinates
     */
    geocodeAddress: async (address: string): Promise<{ lat: number; lng: number }> => {
        const { data } = await apiClient.get<{ lat: number; lng: number }>(
            "/api/listings/geocode/address",
            { params: { address } }
        );
        return data;
    },

    /**
     * Get current user's listings
     */
    getMyListings: async (): Promise<ListingSummary[]> => {
        const { data } = await apiClient.get<ListingSummary[]>(
            "/api/listings/me"
        );
        return data;
    },
};
