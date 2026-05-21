import apiClient from "../../lib/axios";

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface GeocodeResponse extends Coordinates {
    displayName?: string;
}

export interface ReverseGeocodeResponse {
    address: string;
    displayName?: string;
    lat?: number;
    lng?: number;
}

export interface LocationSearchResult extends Coordinates {
    displayName: string;
    type?: string;
    importance?: number;
}

export const mapApi = {
    geocode: async (address: string): Promise<GeocodeResponse> => {
        const { data } = await apiClient.get<GeocodeResponse>("/api/map/geocode", {
            params: { address },
        });
        return data;
    },

    reverseGeocode: async (lat: number, lng: number): Promise<ReverseGeocodeResponse> => {
        const { data } = await apiClient.get<ReverseGeocodeResponse>("/api/map/reverse", {
            params: { lat, lng },
        });
        return data;
    },

    searchLocations: async (query: string, limit?: number): Promise<LocationSearchResult[]> => {
        const { data } = await apiClient.get<{ results: LocationSearchResult[] }>("/api/map/search", {
            params: { q: query, limit },
        });
        return data.results;
    },
};
