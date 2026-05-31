import * as React from "react";
import { cn } from "@/lib/utils";

type SectionContainerProps = React.HTMLAttributes<HTMLElement> & {
    as?: "main" | "section" | "div";
    size?: "sm" | "md" | "lg" | "xl" | "full";
};

const sizeClass = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-none",
};

export function SectionContainer({
    as = "section",
    size = "xl",
    className,
    ...props
}: SectionContainerProps) {
    const Component = as;

    return (
        <Component
            className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClass[size], className)}
            {...props}
        />
    );
}

type PageHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
};

export function PageHeader({
    eyebrow,
    title,
    description,
    actions,
    className,
    ...props
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
                className
            )}
            {...props}
        >
            <div className="min-w-0">
                {eyebrow && (
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                        {eyebrow}
                    </p>
                )}
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export function AppSurface({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("min-h-screen overflow-x-hidden bg-slate-50 text-slate-900", className)}
            {...props}
        />
    );
}
