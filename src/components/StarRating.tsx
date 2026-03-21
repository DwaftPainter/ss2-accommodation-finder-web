import { useState } from 'react';

interface StarRatingProps {
    rating: number;
    onRate?: (star: number) => void;
    interactive?: boolean;
}

export function StarRating({ rating, onRate, interactive = false }: StarRatingProps) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`text-lg transition-all ${star <= (hover || rating) ? 'text-amber-400' : 'text-slate-600'} ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
                    onClick={() => interactive && onRate?.(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

interface StarBreakdownProps {
    starBreakdown: Record<number, number>;
    totalReviews: number;
}

export function StarBreakdown({ starBreakdown, totalReviews }: StarBreakdownProps) {
    return (
        <div className="flex-1 flex flex-col gap-1 justify-center">
            {[5, 4, 3, 2, 1].map((star) => {
                const count = starBreakdown[star] || 0;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                    <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-8 text-slate-400">{star} ★</span>
                        <div className="flex-1 h-1.5 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-5 text-right">{count}</span>
                    </div>
                );
            })}
        </div>
    );
}
