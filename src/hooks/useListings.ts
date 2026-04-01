import { useEffect } from "react";
import {
    useListingsStore,
    useListings,
    useCurrentListing,
    useSavedListings,
    useListingsFilters,
} from "../stores";
import type { ListingFilters } from "../types";

/**
 * Hook for managing listings
 */
export function useListingsManager() {
    const listings = useListings();
    const filters = useListingsFilters();
    const store = useListingsStore();

    const {
        fetchListings,
        setFilters,
        resetFilters,
        isLoading,
        error,
    } = store;

    // Fetch listings when filters change
    useEffect(() => {
        fetchListings(filters);
    }, [fetchListings, filters]);

    const updateFilters = (newFilters: Partial<ListingFilters>) => {
        setFilters(newFilters);
    };

    return {
        listings,
        filters,
        isLoading,
        error,
        updateFilters,
        resetFilters,
    };
}

/**
 * Hook for managing a single listing
 */
export function useListingDetail(listingId?: string) {
    const currentListing = useCurrentListing();
    const { fetchListingDetail, clearCurrentListing, isLoadingDetail } =
        useListingsStore();

    useEffect(() => {
        if (listingId) {
            fetchListingDetail(listingId);
        }
        return () => {
            clearCurrentListing();
        };
    }, [listingId, fetchListingDetail, clearCurrentListing]);

    return {
        listing: currentListing,
        isLoading: isLoadingDetail,
    };
}

/**
 * Hook for managing saved listings
 */
export function useSavedListingsManager() {
    const savedListings = useSavedListings();
    const { fetchSavedListings, toggleSaved, isLoadingSaved } =
        useListingsStore();

    useEffect(() => {
        fetchSavedListings();
    }, [fetchSavedListings]);

    return {
        savedListings,
        isLoading: isLoadingSaved,
        toggleSaved,
        refresh: fetchSavedListings,
    };
}
