import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
        | "default"
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
                "bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-500/20",
            destructive:
                "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20",
            outline:
                "border border-slate-600 bg-transparent hover:bg-slate-700 focus:ring-slate-500/20",
            secondary:
                "bg-slate-700 text-slate-100 hover:bg-slate-600 focus:ring-slate-500/20",
            ghost:
                "hover:bg-slate-700 hover:text-slate-100 focus:ring-slate-500/20",
            link: "text-indigo-400 underline-offset-4 hover:underline focus:ring-0",
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-8 px-3 text-sm",
            lg: "h-12 px-6 text-lg",
            icon: "h-10 w-10 p-0",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium",
                    "transition-all duration-200 ease-out",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
                    "disabled:opacity-50 disabled:pointer-events-none",
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
