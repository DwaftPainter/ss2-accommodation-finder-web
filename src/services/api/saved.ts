import apiClient from "../../lib/axios";
import type { SavedListing } from "../../types";

export interface ToggleSavedResponse {
    saved: boolean;
    message: string;
}

export const savedApi = {
    /**
     * Get all saved listings
     */
    getAll: async (page = 1, limit = 20): Promise<SavedListing[]> => {
        const { data } = await apiClient.get<SavedListing[]>("/api/listings/saved", {
            params: { page, limit }
        });
        return data;
    },

    /**
     * Save a listing
     */
    save: async (listingId: string): Promise<void> => {
        await apiClient.post("/api/listings/saved", { listingId });
    },

    /**
     * Unsave a listing
     */
    unsave: async (listingId: string): Promise<void> => {
        await apiClient.delete(`/api/listings/saved/${listingId}`);
    },

    /**
     * Check if a listing is saved
     */
    checkStatus: async (listingId: string): Promise<boolean> => {
        const { data } = await apiClient.get<boolean>(
            `/api/listings/saved/check/${listingId}`
        );
        return data;
    },
};
