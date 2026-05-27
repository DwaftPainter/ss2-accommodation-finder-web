import { MapPin, type LucideProps } from "lucide-react";
import { cn } from "../../lib/utils";

type MapPinIconProps = LucideProps;

export function MapPinIcon({ className, size = 14, strokeWidth = 2.25, ...props }: MapPinIconProps) {
    return (
        <MapPin
            aria-hidden="true"
            size={size}
            strokeWidth={strokeWidth}
            className={cn("shrink-0 text-emerald-600", className)}
            {...props}
        />
    );
}
