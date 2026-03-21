import { useState } from 'react';
import { Search } from 'lucide-react';
import type { ListingFilters } from '../types';

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
    visible: boolean;
}

export default function FilterPanel({ filters, onFilterChange, onSearch, visible }: FilterPanelProps) {
    const [searchText, setSearchText] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilterChange({ ...filters, search: searchText });
        onSearch();
    };

    const handleUtilityToggle = (utility: string) => {
        const current = filters.utilities || [];
        const updated = current.includes(utility)
            ? current.filter((u) => u !== utility)
            : [...current, utility];
        onFilterChange({ ...filters, utilities: updated });
    };

    const handleClear = () => {
        setSearchText('');
        onFilterChange({});
        onSearch();
    };

    if (!visible) return null;

    return (
        <div className="w-80 bg-[var(--color-bg-glass)] backdrop-blur-xl border-r border-white/[0.08] p-4 overflow-y-auto flex flex-col gap-4 animate-slide-left max-md:absolute max-md:top-0 max-md:left-0 max-md:h-full max-md:z-[1500] max-md:shadow-2xl" id="filter-panel">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Tìm kiếm & Bộ lọc</h3>
                <button onClick={handleClear} className="text-xs px-2.5 py-1 rounded-md text-slate-400 hover:bg-white/[0.06] hover:text-white transition-all" id="clear-filters-btn">
                    Xóa bộ lọc
                </button>
            </div>

            {/* Search */}
            <form className="flex flex-col gap-2" onSubmit={handleSearchSubmit}>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tìm kiếm</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                        type="text"
                        className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-primary)] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-[var(--color-accent-glow)] transition-all"
                        placeholder="Tên đường, quận, phường..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        id="search-input"
                    />
                </div>
            </form>

            {/* Price Range */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Giá thuê (VNĐ/tháng)</label>
                <div className="flex items-center gap-2">
                    <input type="number" className="w-full px-3 py-2.5 bg-[var(--color-bg-primary)] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" placeholder="Từ" value={filters.price_min || ''} onChange={(e) => onFilterChange({ ...filters, price_min: e.target.value })} id="price-min-input" />
                    <span className="text-slate-500">—</span>
                    <input type="number" className="w-full px-3 py-2.5 bg-[var(--color-bg-primary)] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" placeholder="Đến" value={filters.price_max || ''} onChange={(e) => onFilterChange({ ...filters, price_max: e.target.value })} id="price-max-input" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { label: '< 2tr', min: '', max: '2000000' },
                        { label: '2-5tr', min: '2000000', max: '5000000' },
                        { label: '5-10tr', min: '5000000', max: '10000000' },
                        { label: '> 10tr', min: '10000000', max: '' },
                    ].map((p) => (
                        <button key={p.label} className="px-3 py-1 text-xs rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08] hover:bg-indigo-500/15 hover:text-indigo-400 hover:border-indigo-500 transition-all" onClick={() => onFilterChange({ ...filters, price_min: p.min, price_max: p.max })}>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Area Range */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Diện tích (m²)</label>
                <div className="flex items-center gap-2">
                    <input type="number" className="w-full px-3 py-2.5 bg-[var(--color-bg-primary)] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" placeholder="Từ" value={filters.area_min || ''} onChange={(e) => onFilterChange({ ...filters, area_min: e.target.value })} id="area-min-input" />
                    <span className="text-slate-500">—</span>
                    <input type="number" className="w-full px-3 py-2.5 bg-[var(--color-bg-primary)] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" placeholder="Đến" value={filters.area_max || ''} onChange={(e) => onFilterChange({ ...filters, area_max: e.target.value })} id="area-max-input" />
                </div>
            </div>

            {/* Utilities */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tiện ích</label>
                <div className="flex flex-wrap gap-1.5">
                    {UTILITY_OPTIONS.map((opt) => {
                        const active = (filters.utilities || []).includes(opt.value);
                        return (
                            <label key={opt.value} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border ${active ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400' : 'bg-white/[0.06] border-white/[0.08] text-slate-400 hover:border-white/[0.15]'}`}>
                                <input type="checkbox" className="hidden" checked={active} onChange={() => handleUtilityToggle(opt.value)} />
                                {opt.label}
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Apply */}
            <button onClick={onSearch} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm hover:shadow-[0_0_20px_var(--color-accent-glow)] hover:-translate-y-0.5 transition-all" id="apply-filters-btn">
                <Search size={14} />
                Áp dụng bộ lọc
            </button>
        </div>
    );
}
