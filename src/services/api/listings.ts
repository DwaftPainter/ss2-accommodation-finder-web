import apiClient from "../../lib/axios";
import type {
    ListingSummary,
    ListingDetail,
    ListingFormData,
    ListingFilters,
} from "../../types";

/**
 * Build query string from filters
 */
function buildQueryString(
    params: Record<string, string | number | undefined | string[]
>): string {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, val]) => {
        if (val === undefined || val === null || val === "") return;

        if (Array.isArray(val)) {
            val.forEach((v) => query.append(key, String(v)));
        } else {
            query.set(key, String(val));
        }
    });

    const qs = query.toString();
    return qs ? `?${qs}` : "";
}

export const listingsApi = {
    /**
     * Get all listings with filters
     */
    getAll: async (
        filters: ListingFilters = {}
    ): Promise<ListingSummary[]> => {
        const query = buildQueryString(filters as Record<
            string,
            string | number | undefined | string[]
        >);
        const { data } = await apiClient.get<ListingSummary[]>(
            `/api/listings${query}`
        );
        return data;
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
    create: async (formData: ListingFormData): Promise<ListingDetail> => {
        const { data } = await apiClient.post<ListingDetail>(
            "/api/listings",
            formData
        );
        return data;
    },

    /**
     * Update listing
     */
    update: async (
        id: string,
        formData: Partial<ListingFormData>
    ): Promise<ListingDetail> => {
        const { data } = await apiClient.put<ListingDetail>(
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
};
