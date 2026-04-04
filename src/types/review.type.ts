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
