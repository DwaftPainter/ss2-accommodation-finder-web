import apiClient from "../../lib/axios";
import type { ReviewsResponse, Review } from "../../types";

export interface CreateReviewData {
    rating: number;
    comment: string;
}

export const reviewsApi = {
    /**
     * Get reviews for a listing
     */
    getByListing: async (listingId: string): Promise<ReviewsResponse> => {
        const { data } = await apiClient.get<ReviewsResponse>(
            `/api/listings/${listingId}/reviews`
        );
        return data;
    },

    /**
     * Create a review for a listing
     */
    create: async (
        listingId: string,
        reviewData: CreateReviewData
    ): Promise<Review> => {
        const { data } = await apiClient.post<Review>(
            `/api/listings/${listingId}/reviews`,
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
