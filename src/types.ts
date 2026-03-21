export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
}

export interface ListingSummary {
    id: string;
    title: string;
    address: string;
    lat: number;
    lng: number;
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

export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    listingId: string;
    userId: string;
    createdAt: string;
    user: { id: string; name: string; avatarUrl: string | null };
}

export interface ReviewsResponse {
    reviews: Review[];
    avgRating: number;
    totalReviews: number;
    starBreakdown: Record<number, number>;
}

export interface SavedListing extends ListingSummary {
    savedAt: string;
}

export interface ListingFilters {
    search?: string;
    price_min?: string | number;
    price_max?: string | number;
    area_min?: string | number;
    area_max?: string | number;
    utilities?: string[];
    lat?: number;
    lng?: number;
    radius?: number;
}

export interface ListingFormData {
    title: string;
    address: string;
    lat: string | number;
    lng: string | number;
    price: string | number;
    area: string | number;
    electricityFee: string | number;
    waterFee: string | number;
    description: string;
    utilities: string[];
    contactName: string;
    contactPhone: string;
}
