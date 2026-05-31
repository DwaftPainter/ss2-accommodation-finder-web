import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox } from "lucide-react";
import Loader from "./loading";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type StateProps = {
    title?: string;
    description?: string;
    className?: string;
};

export function LoadingState({ title = "Đang tải dữ liệu", description, className }: StateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-center", className)}>
            <Loader />
            {title && <p className="text-sm font-medium text-slate-700">{title}</p>}
            {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
        </div>
    );
}

type EmptyStateProps = StateProps & {
    icon?: LucideIcon;
    action?: {
        label: string;
        onClick: () => void;
    };
};

export function EmptyState({
    icon: Icon = Inbox,
    title = "Không có dữ liệu",
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center px-4 py-16 text-center", className)}>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon size={30} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
            {description && <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>}
            {action && (
                <Button type="button" variant="primary" className="mt-6" onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}

export function ErrorState({
    title = "Không thể tải dữ liệu",
    description,
    className,
}: StateProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700",
                className
            )}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                    <p className="font-semibold">{title}</p>
                    {description && <p className="mt-1 leading-6">{description}</p>}
                </div>
            </div>
        </div>
    );
}
