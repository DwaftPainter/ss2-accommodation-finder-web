import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { reviewsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { StarRating, StarBreakdown } from './StarRating';
import { REVIEW_MESSAGES, getErrorMessage } from '../config/messages';
import type { Review } from '../types';

const reviewSchema = z.object({
    rating: z.number().min(1, 'Vui lòng chọn số sao').max(5),
    comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewSectionProps {
    listingId: string;
}

export default function ReviewSection({ listingId }: ReviewSectionProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [starBreakdown, setStarBreakdown] = useState<Record<number, number>>({});
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);

    const {
        handleSubmit,
        setValue,
        watch,
        reset,
        register,
        formState: { errors, isSubmitting },
    } = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 0, comment: '' },
    });

    const currentRating = watch('rating');
    const commentRegister = register('comment');

    const fetchReviews = () => {
        setLoading(true);
        reviewsApi
            .getByListing(listingId)
            .then((data) => {
                setReviews(data.reviews);
                setAvgRating(data.avgRating);
                setStarBreakdown(data.starBreakdown);
                setTotalReviews(data.totalReviews);
            })
            .catch((err) => {
                const errorMessage = getErrorMessage(err, REVIEW_MESSAGES.FETCH_ERROR);
                toast.error(errorMessage);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchReviews(); }, [listingId]);

    const onSubmit = async (data: ReviewFormValues) => {
        try {
            await reviewsApi.create(listingId, { rating: data.rating, comment: data.comment || '' });
            toast.success(REVIEW_MESSAGES.SUBMIT_SUCCESS);
            reset();
            fetchReviews();
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, REVIEW_MESSAGES.SUBMIT_ERROR);
            toast.error(errorMessage);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        try {
            await reviewsApi.delete(reviewId);
            toast.success(REVIEW_MESSAGES.DELETE_SUCCESS);
            fetchReviews();
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, REVIEW_MESSAGES.DELETE_ERROR);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="border-t border-white/[0.08] pt-5" id="review-section">
            <h3 className="text-base font-bold mb-4">Đánh giá & Nhận xét</h3>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-7 h-7 border-[3px] border-white/[0.08] border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Summary */}
                    <div className="flex gap-6 mb-5 p-4 bg-white/[0.04] rounded-lg max-sm:flex-col">
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                            <span className="text-3xl font-extrabold text-amber-400">{avgRating}</span>
                            <StarRating rating={Math.round(avgRating)} />
                            <span className="text-xs text-slate-500">{totalReviews} đánh giá</span>
                        </div>
                        <StarBreakdown starBreakdown={starBreakdown} totalReviews={totalReviews} />
                    </div>

                    {/* Review Form */}
                    {user ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-4 mb-4 flex flex-col gap-2.5" id="review-form">
                            <h4 className="text-sm font-semibold">Viết đánh giá</h4>
                            <div>
                                <StarRating
                                    rating={currentRating}
                                    onRate={(star) => setValue('rating', star, { shouldValidate: true })}
                                    interactive
                                />
                                {errors.rating && <span className="text-[11px] text-red-400 mt-0.5 block">{errors.rating.message}</span>}
                            </div>
                            <textarea
                                className="w-full px-3 py-2.5 bg-[var(--color-bg-primary)] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-y min-h-[80px]"
                                placeholder="Chia sẻ trải nghiệm của bạn..."
                                rows={3}
                                id="review-comment-input"
                                {...commentRegister}
                            />
                            <button type="submit" disabled={isSubmitting || currentRating === 0} className="self-start px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm hover:shadow-[0_0_20px_var(--color-accent-glow)] disabled:opacity-50 disabled:cursor-not-allowed transition-all" id="submit-review-btn">
                                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </form>
                    ) : (
                        <p className="text-center py-4 text-slate-500 text-sm border border-dashed border-white/[0.08] rounded-lg mb-4">
                            Đăng nhập để viết đánh giá
                        </p>
                    )}

                    {/* Review List */}
                    <div className="flex flex-col gap-2.5">
                        {reviews.length === 0 ? (
                            <p className="text-center text-slate-500 py-5">Chưa có đánh giá nào.</p>
                        ) : (
                            reviews.map((r) => {
                                const isOwnReview = user?.id === r.userId;
                                return (
                                    <div key={r.id} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 hover:border-white/[0.15] transition-all">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[11px] font-semibold text-white overflow-hidden">
                                                    {r.user.avatarUrl ? (
                                                        <img src={r.user.avatarUrl} alt={r.user.name} className="w-full h-full object-cover" />
                                                    ) : r.user.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium block">{r.user.name}</span>
                                                    <span className="text-[11px] text-slate-500 block">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StarRating rating={r.rating} />
                                                {isOwnReview && (
                                                    <button
                                                        onClick={() => handleDeleteReview(r.id)}
                                                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                                        title="Xóa đánh giá"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {r.comment && <p className="text-sm text-slate-300 leading-relaxed">{r.comment}</p>}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
