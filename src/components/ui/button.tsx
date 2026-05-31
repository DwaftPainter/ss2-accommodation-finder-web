import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
        | "default"
        | "primary"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link";
    size?: "default" | "sm" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "default",
            size = "default",
            isLoading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const variants = {
            default:
                "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500/25",
            primary:
                "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700 hover:shadow-md focus-visible:ring-emerald-500/25",
            destructive:
                "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500/25",
            outline:
                "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-500/20",
            secondary:
                "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500/20",
            ghost:
                "text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-500/20",
            link: "text-emerald-700 underline-offset-4 hover:text-emerald-800 hover:underline focus-visible:ring-0",
        };

        const sizes = {
            default: "h-10 px-4 py-2 text-sm",
            sm: "h-9 px-3 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10 p-0",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium",
                    "transition-all duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    "disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    isLoading && "opacity-70 cursor-not-allowed",
                    className
                )}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
