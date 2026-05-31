/**
 * App-wide constants
 */

export const APP_NAME = "AccomFinder";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const STORAGE_KEYS = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    THEME: "theme",
} as const;

export const MAP_DEFAULTS = {
    CENTER: { lat: 10.762622, lng: 106.660172 }, // Ho Chi Minh City
    ZOOM: 13,
    MAX_ZOOM: 18,
    MIN_ZOOM: 10,
} as const;

export const PRICE_RANGES = [
    { min: 0, max: 2000000, label: "Dưới 2 triệu" },
    { min: 2000000, max: 4000000, label: "2 - 4 triệu" },
    { min: 4000000, max: 6000000, label: "4 - 6 triệu" },
    { min: 6000000, max: 10000000, label: "6 - 10 triệu" },
    { min: 10000000, max: Infinity, label: "Trên 10 triệu" },
] as const;

export const AREA_RANGES = [
    { min: 0, max: 20, label: "Dưới 20m²" },
    { min: 20, max: 40, label: "20m² - 40m²" },
    { min: 40, max: 60, label: "40m² - 60m²" },
    { min: 60, max: 100, label: "60m² - 100m²" },
    { min: 100, max: Infinity, label: "Trên 100m²" },
] as const;

export const COMMON_UTILITIES = [
    "wifi",
    "parking",
    "ac",
    "fridge",
    "washing_machine",
    "tv",
    "security",
    "balcony",
    "furnished",
] as const;
