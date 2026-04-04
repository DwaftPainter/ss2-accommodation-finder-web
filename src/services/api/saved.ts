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
    getAll: async (): Promise<SavedListing[]> => {
        const { data } = await apiClient.get<SavedListing[]>("/api/saved");
        return data;
    },

    /**
     * Toggle saved status for a listing
     */
    toggle: async (
        listingId: string
    ): Promise<ToggleSavedResponse> => {
        const { data } = await apiClient.post<ToggleSavedResponse>(
            `/api/saved/${listingId}`
        );
        return data;
    },

    /**
     * Check if a listing is saved
     */
    checkStatus: async (listingId: string): Promise<boolean> => {
        const { data } = await apiClient.get<{ saved: boolean }>(
            `/api/saved/${listingId}/status`
        );
        return data.saved;
    },
};
