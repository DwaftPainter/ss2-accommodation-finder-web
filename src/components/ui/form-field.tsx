import * as React from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
    id?: string;
    label: React.ReactNode;
    error?: React.ReactNode;
    helperText?: React.ReactNode;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
};

export function FormField({
    id,
    label,
    error,
    helperText,
    required,
    className,
    children,
}: FormFieldProps) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <label htmlFor={id} className="text-sm font-medium text-slate-700">
                {label}
                {required && <span className="ml-1 text-rose-500">*</span>}
            </label>
            {children}
            {helperText && !error && <p className="text-xs leading-5 text-slate-500">{helperText}</p>}
            {error && <p className="text-xs leading-5 text-rose-600">{error}</p>}
        </div>
    );
}
