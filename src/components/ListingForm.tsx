import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { listingsApi } from '../services/api';
import type { ListingDetail } from '../types';

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

const listingSchema = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề quá dài'),
    address: z.string().min(1, 'Địa chỉ không được để trống'),
    lat: z.coerce.number({ error: 'Vĩ độ phải là số' }).min(-90).max(90),
    lng: z.coerce.number({ error: 'Kinh độ phải là số' }).min(-180).max(180),
    price: z.coerce.number({ error: 'Giá phải là số' }).min(100000, 'Giá tối thiểu 100.000 đ'),
    area: z.coerce.number({ error: 'Diện tích phải là số' }).min(1, 'Diện tích tối thiểu 1 m²'),
    electricityFee: z.coerce.number().or(z.literal('')).optional(),
    waterFee: z.coerce.number().or(z.literal('')).optional(),
    description: z.string().optional(),
    utilities: z.array(z.string()),
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
});

type ListingFormValues = z.infer<typeof listingSchema>;
type ListingFormInput = z.input<typeof listingSchema>;

export interface ListingFormData {
    title: string;
    address: string;
    lat: number;
    lng: number;
    price: number;
    area: number;
    electricityFee?: number;
    waterFee?: number;
    description?: string;
    utilities: string[];
    contactName?: string;
    contactPhone?: string;
}

interface ListingFormProps {
    listing: ListingDetail | null;
    pinLocation: { lat: number; lng: number } | null;
    onClose: () => void;
    onSaved: (data: ListingFormData) => Promise<void> | void;
}

export default function ListingForm({ listing, pinLocation, onClose, onSaved }: ListingFormProps) {
    const isEdit = !!listing;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ListingFormInput>({
        resolver: zodResolver(listingSchema),
        defaultValues: {
            title: '', address: '', lat: 0, lng: 0, price: 0, area: 0,
            electricityFee: '', waterFee: '', description: '', utilities: [],
            contactName: '', contactPhone: '',
        },
    });

    const utilities = watch('utilities');

    useEffect(() => {
        if (listing) {
            reset({
                title: listing.title, address: listing.address,
                lat: listing.lat, lng: listing.lng,
                price: listing.price, area: listing.area,
                electricityFee: listing.electricityFee || '',
                waterFee: listing.waterFee || '',
                description: listing.description || '',
                utilities: listing.utilities || [],
                contactName: listing.contactName || '',
                contactPhone: listing.contactPhone || '',
            });
        } else if (pinLocation) {
            setValue('lat', parseFloat(pinLocation.lat.toFixed(6)));
            setValue('lng', parseFloat(pinLocation.lng.toFixed(6)));
        }
    }, [listing, pinLocation, reset, setValue]);

    const handleUtilityToggle = (u: string) => {
        const current = utilities || [];
        setValue(
            'utilities',
            current.includes(u) ? current.filter((x) => x !== u) : [...current, u],
            { shouldValidate: true }
        );
    };

    const onSubmit = async (rawData: ListingFormInput) => {
        const data = rawData as ListingFormValues;
        const payload: ListingFormData = {
            title: data.title,
            address: data.address,
            lat: data.lat,
            lng: data.lng,
            price: data.price,
            area: data.area,
            electricityFee: data.electricityFee || undefined,
            waterFee: data.waterFee || undefined,
            description: data.description || undefined,
            utilities: data.utilities || [],
            contactName: data.contactName || undefined,
            contactPhone: data.contactPhone || undefined,
        };
        try {
            if (isEdit && listing) {
                await listingsApi.update(listing.id, payload as any);
                toast.success('Cập nhật tin thành công!');
            } else {
                await listingsApi.create(payload as any);
                toast.success('Đăng tin thành công!');
            }
            await onSaved(payload);
            onClose();
        } catch (err: unknown) {
            toast.error('Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'));
        }
    };

    const inputCls = "w-full px-3 py-2.5 bg-[var(--color-bg-primary)] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-[var(--color-accent-glow)] transition-all";
    const errorCls = "text-[11px] text-red-400 mt-0.5";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-5 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-[var(--color-bg-secondary)] border border-white/[0.08] rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl w-[650px] max-w-full p-6 relative animate-modal-in" id="listing-form-modal">
                <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/[0.06] text-slate-400 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all">
                    <X size={18} />
                </button>

                <h2 className="text-lg font-bold mb-5 pr-10">{isEdit ? '✏️ Sửa tin đăng' : '📍 Đăng phòng trọ mới'}</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                        {/* Title */}
                        <div className="col-span-2 max-sm:col-span-1 flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Tiêu đề *</label>
                            <input {...register('title')} className={inputCls} placeholder="VD: Phòng trọ cao cấp gần ĐH Bách Khoa" id="form-title" />
                            {errors.title && <span className={errorCls}>{errors.title.message}</span>}
                        </div>

                        {/* Address */}
                        <div className="col-span-2 max-sm:col-span-1 flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Địa chỉ *</label>
                            <input {...register('address')} className={inputCls} placeholder="Số nhà, đường, phường, quận" id="form-address" />
                            {errors.address && <span className={errorCls}>{errors.address.message}</span>}
                        </div>

                        {/* Lat / Lng */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Vĩ độ (Lat) *</label>
                            <input {...register('lat')} type="number" step="0.000001" className={inputCls} id="form-lat" />
                            {errors.lat && <span className={errorCls}>{errors.lat.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Kinh độ (Lng) *</label>
                            <input {...register('lng')} type="number" step="0.000001" className={inputCls} id="form-lng" />
                            {errors.lng && <span className={errorCls}>{errors.lng.message}</span>}
                        </div>

                        {/* Price / Area */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Giá thuê (VNĐ/tháng) *</label>
                            <input {...register('price')} type="number" className={inputCls} placeholder="3000000" id="form-price" />
                            {errors.price && <span className={errorCls}>{errors.price.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Diện tích (m²) *</label>
                            <input {...register('area')} type="number" step="0.1" className={inputCls} placeholder="25" id="form-area" />
                            {errors.area && <span className={errorCls}>{errors.area.message}</span>}
                        </div>

                        {/* Fees */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Tiền điện (VNĐ/kWh)</label>
                            <input {...register('electricityFee')} type="number" className={inputCls} placeholder="3500" id="form-electricity" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Tiền nước (VNĐ/m³)</label>
                            <input {...register('waterFee')} type="number" className={inputCls} placeholder="30000" id="form-water" />
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Tên liên hệ</label>
                            <input {...register('contactName')} className={inputCls} placeholder="Tên người liên hệ" id="form-contact-name" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Số điện thoại</label>
                            <input {...register('contactPhone')} type="tel" className={inputCls} placeholder="0912345678" id="form-contact-phone" />
                        </div>

                        {/* Description */}
                        <div className="col-span-2 max-sm:col-span-1 flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Mô tả</label>
                            <textarea {...register('description')} className={`${inputCls} resize-y min-h-[80px]`} placeholder="Mô tả chi tiết về phòng trọ..." rows={3} id="form-description" />
                        </div>

                        {/* Utilities */}
                        <div className="col-span-2 max-sm:col-span-1 flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400">Tiện ích</label>
                            <div className="flex flex-wrap gap-1.5">
                                {UTILITY_OPTIONS.map((opt) => {
                                    const active = (utilities || []).includes(opt.value);
                                    return (
                                        <label key={opt.value} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border ${active ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400' : 'bg-white/[0.06] border-white/[0.08] text-slate-400 hover:border-white/[0.15]'}`}>
                                            <input type="checkbox" className="hidden" checked={active} onChange={() => handleUtilityToggle(opt.value)} />
                                            {opt.label}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/[0.08]">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/[0.06] transition-all">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm hover:shadow-[0_0_20px_var(--color-accent-glow)] disabled:opacity-50 transition-all" id="submit-listing-btn">
                            {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Đăng tin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
