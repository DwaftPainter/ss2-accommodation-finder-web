import { useState } from 'react';
import { Crosshair, Search } from 'lucide-react';
import provinces from '../assets/provinces.json';
import type { ListingFilters } from '../types';
import { toast } from 'sonner';

type ProvinceWard = {
    wardCode: string;
    name: string;
};

type Province = {
    provinceCode: string;
    name: string;
    wards: ProvinceWard[];
};

const PROVINCES = provinces as Province[];
const DEFAULT_PROVINCE = PROVINCES[0]?.name ?? '';

const FURNITURE_OPTIONS = [
    { value: 'full', label: 'Full đồ' },
    { value: 'basic', label: 'Cơ bản' },
    { value: 'empty', label: 'Không đồ' },
];

const UTILITY_OPTIONS = [
    { value: 'wifi', label: 'WiFi' },
    { value: 'air_conditioning', label: 'Điều hòa' },
    { value: 'balcony', label: 'Ban công' },
    { value: 'washing_machine', label: 'Máy giặt' },
    { value: 'parking', label: 'Chỗ để xe' },
    { value: 'elevator', label: 'Thang máy' },
    { value: 'security', label: 'Bảo vệ 24/7' },
    { value: 'flexible_hours', label: 'Giờ giấc tự do' },
];

interface FilterPanelProps {
    filters: ListingFilters;
    onFilterChange: (filters: ListingFilters) => void;
    onSearch: () => void;
    onNearbySearch: (position: { lat: number; lng: number }, radius: number) => void;
    isSearching?: boolean;
    visible: boolean;
}

export default function FilterPanel({
    filters,
    onFilterChange,
    onSearch,
    onNearbySearch,
    isSearching = false,
    visible,
}: FilterPanelProps) {
    const [selectedProvince, setSelectedProvince] = useState<string>(filters.province || DEFAULT_PROVINCE);
    const [isLocating, setIsLocating] = useState(false);

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const province = e.target.value;
        setSelectedProvince(province);
        onFilterChange({ ...filters, province, district: '', ward: '' });
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, province: selectedProvince, district: '', ward: e.target.value });
    };

    const handleUtilityToggle = (utility: string) => {
        const current = filters.utilities || [];
        const updated = current.includes(utility)
            ? current.filter((u) => u !== utility)
            : [...current, utility];
        onFilterChange({ ...filters, utilities: updated });
    };

    const handleClear = () => {
        setSelectedProvince(DEFAULT_PROVINCE);
        onFilterChange({});
    };

    const handleNearbyClick = () => {
        if (!navigator.geolocation) {
            toast.error('Trình duyệt không hỗ trợ định vị');
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const radius = Number(filters.radius) > 0 ? Number(filters.radius) : 5;

                onNearbySearch(
                    {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    },
                    radius,
                );

                setIsLocating(false);
            },
            (error) => {
                const message =
                    error.code === error.PERMISSION_DENIED
                        ? 'Bạn đã từ chối quyền truy cập vị trí'
                        : error.code === error.TIMEOUT
                          ? 'Hết thời gian xác định vị trí'
                          : 'Không thể xác định vị trí hiện tại';
                toast.error(message);
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        );
    };

    if (!visible) return null;

    const selectedProvinceData = PROVINCES.find((province) => province.name === selectedProvince);
    const wards = selectedProvinceData?.wards ?? [];

    return (
        <div className="flex h-full w-80 max-w-[85vw] shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-white p-4 animate-slide-left max-md:absolute max-md:left-0 max-md:top-0 max-md:z-[1500] max-md:shadow-2xl" id="filter-panel">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">Tìm kiếm & Bộ lọc</h3>
                <button onClick={handleClear} className="text-xs px-2.5 py-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all" id="clear-filters-btn">
                    Xóa bộ lọc
                </button>
            </div>

            {/* Location Selector */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Khu vực</label>
                <div className="flex flex-col gap-2">
                    <select
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                    >
                        {PROVINCES.map(province => (
                            <option key={province.provinceCode} value={province.name}>{province.name}</option>
                        ))}
                    </select>

                    <select
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                        value={filters.ward || ''}
                        onChange={handleWardChange}
                    >
                        <option value="">Tất cả Phường/Xã</option>
                        {wards.map(ward => (
                            <option key={ward.wardCode} value={ward.name}>{ward.name}</option>
                        ))}
                    </select>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-emerald-900">Tìm chỗ ở gần bạn</p>
                            <p className="text-xs text-emerald-700">Dùng vị trí hiện tại để gọi nearby endpoint.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleNearbyClick}
                            disabled={isLocating || isSearching}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Tìm chỗ ở gần bạn"
                        >
                            <Crosshair size={16} />
                        </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <label htmlFor="nearby-radius-input" className="text-xs font-medium text-emerald-800">
                            Bán kính
                        </label>
                        <input
                            id="nearby-radius-input"
                            type="number"
                            min="1"
                            max="50"
                            step="1"
                            className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            placeholder="5"
                            value={filters.radius || ''}
                            onChange={(e) =>
                                onFilterChange({
                                    ...filters,
                                    radius: e.target.value ? Number(e.target.value) : undefined,
                                })
                            }
                        />
                        <span className="text-xs text-emerald-700">km</span>
                    </div>
                </div>
            </div>

            {/* Furniture */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nội thất phòng</label>
                <div className="flex flex-wrap gap-1.5">
                    {FURNITURE_OPTIONS.map((opt) => {
                        const active = filters.furniture === opt.value;
                        return (
                            <button
                                key={opt.value}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border ${active ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'}`}
                                onClick={() => onFilterChange({ ...filters, furniture: active ? undefined : opt.value })}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Price Range */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Giá thuê (VNĐ/tháng)</label>
                <div className="flex items-center gap-2">
                    <input type="number" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" placeholder="Từ" value={filters.price_min || ''} onChange={(e) => onFilterChange({ ...filters, price_min: e.target.value })} id="price-min-input" />
                    <span className="text-slate-400">—</span>
                    <input type="number" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" placeholder="Đến" value={filters.price_max || ''} onChange={(e) => onFilterChange({ ...filters, price_max: e.target.value })} id="price-max-input" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { label: '< 2tr', min: '', max: '2000000' },
                        { label: '2-5tr', min: '2000000', max: '5000000' },
                        { label: '5-10tr', min: '5000000', max: '10000000' },
                        { label: '> 10tr', min: '10000000', max: '' },
                    ].map((p) => (
                        <button key={p.label} className="px-3 py-1 text-xs rounded-full bg-slate-50 text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-all" onClick={() => onFilterChange({ ...filters, price_min: p.min, price_max: p.max })}>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Area Range */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Diện tích (m²)</label>
                <div className="flex items-center gap-2">
                    <input type="number" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" placeholder="Từ" value={filters.area_min || ''} onChange={(e) => onFilterChange({ ...filters, area_min: e.target.value })} id="area-min-input" />
                    <span className="text-slate-400">—</span>
                    <input type="number" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" placeholder="Đến" value={filters.area_max || ''} onChange={(e) => onFilterChange({ ...filters, area_max: e.target.value })} id="area-max-input" />
                </div>
            </div>

            {/* Utilities */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tiện ích</label>
                <div className="flex flex-wrap gap-1.5">
                    {UTILITY_OPTIONS.map((opt) => {
                        const active = (filters.utilities || []).includes(opt.value);
                        return (
                            <label key={opt.value} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border ${active ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'}`}>
                                <input type="checkbox" className="hidden" checked={active} onChange={() => handleUtilityToggle(opt.value)} />
                                {opt.label}
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Apply */}
            <button onClick={onSearch} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all" id="apply-filters-btn">
                <Search size={14} />
                Áp dụng bộ lọc
            </button>
        </div>
    );
}
