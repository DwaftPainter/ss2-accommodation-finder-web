import apiClient from "../../lib/axios";
import type { ReviewsResponse, Review } from "../../types";

export interface CreateReviewData {
    listingId: string;
    rating: number;
    comment: string;
}

export interface UpdateReviewData {
    rating?: number;
    comment?: string;
}

export const reviewsApi = {
    /**
     * Get reviews for a listing
     * Backend returns { data, meta } - we transform to ReviewsResponse
     */
    getByListing: async (listingId: string): Promise<ReviewsResponse> => {
        const response = await apiClient.get<{
            data: Review[];
            meta: {
                total: number;
                averageRating: number;
            };
        }>(`/api/reviews/listing/${listingId}`);

        const reviews = response.data.data;
        const totalReviews = response.data.meta.total;
        const avgRating = response.data.meta.averageRating;

        // Calculate star breakdown
        const starBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((r) => {
            if (r.rating >= 1 && r.rating <= 5) {
                starBreakdown[r.rating] = (starBreakdown[r.rating] || 0) + 1;
            }
        });

        return {
            reviews,
            avgRating,
            totalReviews,
            starBreakdown,
        };
    },

    /**
     * Create a review for a listing
     * POST to /api/reviews with listingId in body
     */
    create: async (
        listingId: string,
        reviewData: Omit<CreateReviewData, "listingId">
    ): Promise<Review> => {
        const { data } = await apiClient.post<Review>("/api/reviews", {
            listingId,
            ...reviewData,
        });
        return data;
    },

    /**
     * Update a review
     */
    update: async (
        reviewId: string,
        reviewData: UpdateReviewData
    ): Promise<Review> => {
        const { data } = await apiClient.patch<Review>(
            `/api/reviews/${reviewId}`,
            reviewData
        );
        return data;
    },

    /**
     * Delete a review
     */
    delete: async (reviewId: string): Promise<void> => {
        await apiClient.delete(`/api/reviews/${reviewId}`);
    },
};
