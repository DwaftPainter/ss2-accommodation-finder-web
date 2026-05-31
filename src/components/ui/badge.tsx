import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement> {
    variant?:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success"
        | "warning";
}

function Badge({
    className,
    variant = "default",
    ...props
}: BadgeProps) {
    const variants = {
        default:
            "border-transparent bg-emerald-100 text-emerald-800",
        secondary:
            "border-transparent bg-slate-100 text-slate-700",
        destructive:
            "border-transparent bg-rose-100 text-rose-700",
        outline:
            "border-slate-200 bg-white text-slate-700",
        success:
            "border-transparent bg-emerald-100 text-emerald-800",
        warning:
            "border-transparent bg-amber-100 text-amber-800",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };
