import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency = "$"): string {
    return `${currency}${price.toLocaleString()}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Address interface from ListingSummary
 */
export interface Address {
    street: string;
    ward: string;
    district: string;
    city: string;
    province: string;
    lat: number;
    lng: number;
}

/**
 * Format address object to readable string
 * Options:
 * - full: street, ward, district, city, province
 * - short: district, city
 * - minimal: city only
 */
export function formatAddress(
    address: Address | string,
    options: { style?: "full" | "short" | "minimal" } = {}
): string {
    const { style = "short" } = options;

    // If address is already a string, return it
    if (typeof address === "string") {
        return address;
    }

    if (style === "full") {
        const parts = [address.street, address.ward, address.district, address.city, address.province].filter(
            Boolean
        );
        return parts.join(", ");
    }

    if (style === "minimal") {
        return address.city || address.province;
    }

    // short - default
    const parts = [address.district, address.city].filter(Boolean);
    return parts.join(", ");
}

/**
 * Get short location name (for display in cards)
 * Returns: "District, City" format
 */
export function getShortLocation(address: Address | string): string {
    return formatAddress(address, { style: "short" });
}

/**
 * Get coordinates from address object
 */
export function getCoordinates(address: Address | string): { lat: number; lng: number } | null {
    if (typeof address === "string") {
        return null;
    }
    return { lat: address.lat, lng: address.lng };
}
