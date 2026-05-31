import { useState } from "react";
import { Search } from "lucide-react";
import type { ListingFilters } from "../../../types";

type SearchInput = {
    location: string;
    price: string;
    keyword: string;
};

function parsePriceFilter(priceInput: string): Pick<ListingFilters, "price_min" | "price_max"> {
    const normalized = priceInput
        .trim()
        .toLowerCase()
        .replace(/,/g, ".")
        .replace(/\s+/g, " ");

    if (!normalized) return {};

    const toVnd = (value: string) => {
        const parsed = Number.parseFloat(value);
        if (!Number.isFinite(parsed)) return undefined;
        return Math.round(parsed * 1_000_000);
    };

    const rangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:-|đến|toi|tới)\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
        return {
            price_min: toVnd(rangeMatch[1]),
            price_max: toVnd(rangeMatch[2]),
        };
    }

    const amountMatch = normalized.match(/(\d+(?:\.\d+)?)/);
    if (!amountMatch) return {};

    const amount = toVnd(amountMatch[1]);
    if (amount === undefined) return {};

    if (
        normalized.includes(">") ||
        normalized.includes("trên") ||
        normalized.includes("tu ") ||
        normalized.includes("từ ")
    ) {
        return { price_min: amount };
    }

    return { price_max: amount };
}

function buildSearchFilters({ location, price, keyword }: SearchInput): ListingFilters {
    const search = [location, keyword]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" ");

    return {
        ...(search ? { search } : {}),
        ...parsePriceFilter(price),
    };
}

export function SearchBar({ onSearch }: { onSearch: (filters: ListingFilters) => void }) {
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState("");
    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        onSearch(buildSearchFilters({ location, price, keyword }));
    };

    return (
        <div className="flex items-center justify-center py-1.5 w-full px-0">
            <div className="flex w-full max-w-md items-center rounded-full border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg md:hidden">
                <div className="flex flex-col px-4 py-2 hover:bg-gray-100 rounded-full transition-colors text-left flex-1 min-w-0">
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Tìm kiếm địa điểm..."
                        className="w-full bg-transparent text-sm text-gray-700 outline-none"
                        aria-label="Tìm kiếm địa điểm"
                    />
                </div>
                <div className="pr-1.5 pl-1">
                    <button
                        type="button"
                        onClick={handleSearch}
                        aria-label="Mở bản đồ tìm kiếm"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        <Search size={16} className="text-white" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="hidden md:flex items-center max-w-full bg-white rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex flex-col px-4 xl:px-6 py-2 hover:bg-gray-100 rounded-full transition-colors text-left min-w-0 w-40 xl:w-[180px]">
                    <span className="text-xs font-semibold text-gray-900">Địa điểm</span>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="VD: Hà Nội, Cầu Giấy..."
                        className="w-full bg-transparent text-sm text-gray-500 outline-none"
                        aria-label="Địa điểm"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300" />

                <div className="flex flex-col px-4 xl:px-6 py-2 hover:bg-gray-100 rounded-full transition-colors text-left min-w-0 w-32 xl:w-[140px]">
                    <span className="text-xs font-semibold text-gray-900">Giá</span>
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="VD: <= 3 triệu"
                        className="w-full bg-transparent text-sm text-gray-500 outline-none"
                        aria-label="Giá thuê"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300" />

                <div className="flex flex-col px-4 xl:px-6 py-2 hover:bg-gray-100 rounded-full transition-colors text-left min-w-0 w-40 xl:w-[160px]">
                    <span className="text-xs font-semibold text-gray-900">Loại / Từ khóa</span>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Phòng trọ, căn hộ, gần trường..."
                        className="w-full bg-transparent text-sm text-gray-500 outline-none"
                        aria-label="Loại phòng hoặc từ khóa"
                    />
                </div>

                <div className="pr-1.5 pl-1">
                    <button
                        type="button"
                        onClick={handleSearch}
                        aria-label="Mở bản đồ tìm kiếm"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        <Search size={16} className="text-white" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
}
