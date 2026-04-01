import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

interface DialogProps {
    open?: boolean;
    onClose?: () => void;
    children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
    if (!open) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
            <div
                className={cn(
                    "relative z-10 w-full max-w-lg",
                    "bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50",
                    "shadow-2xl animate-modal-in"
                )}
            >
                {children}
            </div>
        </div>
    );
};

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
    children,
    className,
}) => (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
        {children}
    </div>
);

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

const DialogTitle: React.FC<DialogTitleProps> = ({
    children,
    className,
}) => (
    <h2
        className={cn(
            "text-xl font-semibold leading-none tracking-tight text-slate-100",
            className
        )}
    >
        {children}
    </h2>
);

interface DialogDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({
    children,
    className,
}) => (
    <p className={cn("text-sm text-slate-400", className)}>{children}</p>
);

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

const DialogContent: React.FC<DialogContentProps> = ({
    children,
    className,
}) => <div className={cn("p-6 pt-0", className)}>{children}</div>;

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

const DialogFooter: React.FC<DialogFooterProps> = ({
    children,
    className,
}) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0",
            className
        )}
    >
        {children}
    </div>
);

interface DialogCloseButtonProps {
    onClick?: () => void;
}

const DialogCloseButton: React.FC<DialogCloseButtonProps> = ({
    onClick,
}) => (
    <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className="absolute right-4 top-4 rounded-full h-8 w-8"
    >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
    </Button>
);

export {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogContent,
    DialogFooter,
    DialogCloseButton,
};
