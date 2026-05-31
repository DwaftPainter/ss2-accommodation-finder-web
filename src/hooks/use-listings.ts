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

/**
 * Hook for searching listings by address
 */
export function useAddressSearch() {
    const listings = useListings();
    const { searchByAddress, isLoading, error } = useListingsStore();

    const search = async (address: string, radius?: number) => {
        await searchByAddress(address, radius);
    };

    return {
        listings,
        isLoading,
        error,
        search,
    };
}

/**
 * Hook for searching listings near coordinates
 */
export function useNearbySearch() {
    const listings = useListings();
    const { searchNearby, isLoading, error } = useListingsStore();

    const search = async (lat: number, lng: number, radius?: number) => {
        await searchNearby(lat, lng, radius);
    };

    return {
        listings,
        isLoading,
        error,
        search,
    };
}

/**
 * Hook for fetching current user's listings
 */
export function useMyListings() {
    const listings = useListings();
    const { fetchMyListings, isLoading, error } = useListingsStore();

    useEffect(() => {
        fetchMyListings();
    }, [fetchMyListings]);

    return {
        listings,
        isLoading,
        error,
        refresh: fetchMyListings,
    };
}
