import { Review } from "./review.type";

export interface ListingSummary {
    id: string;
    title: string;
    address: {
        street: string;
        ward: string;
        district: string;
        city: string;
        province: string;
        lat: number;
        lng: number;
    };
    price: number;
    area: number;
    utilities: string[];
    images: string[];
    owner: { id: string; name: string; avatarUrl: string | null };
    avgRating: number;
    reviewCount: number;
    savedCount?: number;
    createdAt: string;
}

export interface ListingDetail extends ListingSummary {
    electricityFee: number | null;
    waterFee: number | null;
    description: string | null;
    contactName: string | null;
    contactPhone: string | null;
    ownerId: string;
    reviews: Review[];
    starBreakdown: Record<number, number>;
    isSaved: boolean;
}

export interface SavedListing extends ListingSummary {
    savedAt: string;
}

export interface ListingFilters {
    search?: string;
    district?: string;
    ward?: string;
    furniture?: string;
    price_min?: string | number;
    price_max?: string | number;
    area_min?: string | number;
    area_max?: string | number;
    utilities?: string[];
    lat?: number;
    lng?: number;
    radius?: number;
}

export interface ListingPayload {
    title: string;
    address: string;
    lat: number;
    lng: number;
    price: number;
    area: number;
    electricityFee?: number;
    waterFee?: number;
    description?: string;
    utilities: string[];
    images?: string[]; // Required by backend but optional for now
    contactName?: string;
    contactPhone?: string;
}
