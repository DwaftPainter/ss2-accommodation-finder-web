import { List, Plus } from "lucide-react";

interface LandlordNavProps {
    activeTab: "listings" | "create";
    onTabChange: (tab: "listings" | "create") => void;
}

export function LandlordNav({ activeTab, onTabChange }: LandlordNavProps) {
    return (
        <div className="flex items-center justify-center w-full">
            <div className="grid grid-cols-2 w-full max-w-sm sm:max-w-md lg:w-auto lg:max-w-none lg:flex lg:items-center bg-white rounded-full shadow-md border border-gray-200 p-1">
                <button
                    type="button"
                    onClick={() => onTabChange("listings")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-full transition-all ${
                        activeTab === "listings"
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <List size={16} aria-hidden="true" />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Bài đăng</span>
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange("create")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-full transition-all ${
                        activeTab === "create"
                            ? "bg-emerald-500 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <Plus size={16} aria-hidden="true" />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Đăng bài</span>
                </button>
            </div>
        </div>
    );
}
