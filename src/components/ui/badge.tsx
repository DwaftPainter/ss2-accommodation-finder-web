import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement> {
    variant?:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success";
}

function Badge({
    className,
    variant = "default",
    ...props
}: BadgeProps) {
    const variants = {
        default:
            "border-transparent bg-indigo-500 text-white hover:bg-indigo-600",
        secondary:
            "border-transparent bg-slate-700 text-slate-100 hover:bg-slate-600",
        destructive:
            "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline:
            "border-slate-600 text-slate-100 hover:bg-slate-700",
        success:
            "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };
