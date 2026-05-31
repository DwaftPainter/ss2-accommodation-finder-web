import { useEffect, useState, useRef } from 'react';
import { X, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { listingsApi } from '../services/api';
import { LISTING_MESSAGES, getErrorMessage } from '../config/messages';
import type { ListingDetail } from '../types';
import { Button } from './ui';

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
    street: z.string().min(1, 'Đường phố không được để trống'),
    ward: z.string().optional(),
    district: z.string().min(1, 'Quận/Huyện không được để trống'),
    city: z.string().min(1, 'Thành phố không được để trống'),
    province: z.string().min(1, 'Tỉnh/Thành phố không được để trống'),
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
    images: z.array(z.string()).optional(),
});

type ListingFormValues = z.infer<typeof listingSchema>;
type ListingFormInput = z.input<typeof listingSchema>;

export interface ListingFormData {
    title: string;
    street: string;
    ward?: string;
    district: string;
    city: string;
    province: string;
    lat: number;
    lng: number;
    price: number;
    area: number;
    electricityFee?: number;
    waterFee?: number;
    description?: string;
    utilities: string[];
    images: string[]; // Required by backend
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

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
            title: '', street: '', ward: '', district: '', city: '', province: '', lat: 0, lng: 0, price: 0, area: 0,
            electricityFee: '', waterFee: '', description: '', utilities: [],
            contactName: '', contactPhone: '', images: [],
        },
    });

    const utilities = watch('utilities');
    const previewsRef = useRef<string[]>([]);
    previewsRef.current = previews;

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            previewsRef.current.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    useEffect(() => {
        if (listing) {
            reset({
                title: listing.title,
                street: listing.address.street || '',
                ward: listing.address.ward || '',
                district: listing.address.district || '',
                city: listing.address.city || '',
                province: listing.address.province || '',
                lat: listing.address.lat ?? 0,
                lng: listing.address.lng ?? 0,
                price: listing.price, area: listing.area,
                electricityFee: listing.electricityFee || '',
                waterFee: listing.waterFee || '',
                description: listing.description || '',
                utilities: listing.utilities || [],
                contactName: listing.contactName || '',
                contactPhone: listing.contactPhone || '',
                images: listing.images || [],
            });
            setExistingImages(listing.images || []);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Limit total images to 10
        if (imageFiles.length + existingImages.length + files.length > 10) {
            toast.error('Bạn chỉ có thể tải lên tối đa 10 hình ảnh');
            return;
        }

        setImageFiles(prev => [...prev, ...files]);

        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeNewImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            return newPreviews.filter((_, i) => i !== index);
        });
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (rawData: ListingFormInput) => {
        const data = rawData as ListingFormValues;
        
        try {
            setIsUploading(true);
            
            // 1. Upload new images if any
            let uploadedUrls: string[] = [];
            if (imageFiles.length > 0) {
                uploadedUrls = await listingsApi.uploadImages(imageFiles);
            }

            // 2. Combine existing and newly uploaded images
            const finalImages = [...existingImages, ...uploadedUrls];

            // Convert all numeric fields to numbers for API
            const payload: ListingFormData = {
                title: data.title,
                street: data.street,
                ward: data.ward || undefined,
                district: data.district,
                city: data.city,
                province: data.province,
                lat: Number(data.lat),
                lng: Number(data.lng),
                price: Number(data.price),
                area: Number(data.area),
                electricityFee: data.electricityFee ? Number(data.electricityFee) : undefined,
                waterFee: data.waterFee ? Number(data.waterFee) : undefined,
                description: data.description || undefined,
                utilities: data.utilities || [],
                images: finalImages,
                contactName: data.contactName || undefined,
                contactPhone: data.contactPhone || undefined,
            };

            await onSaved(payload);
            onClose();
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                isEdit ? LISTING_MESSAGES.UPDATE_ERROR : LISTING_MESSAGES.CREATE_ERROR
            );
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20";
    const labelCls = "text-sm font-medium text-slate-700";
    const errorCls = "text-xs leading-5 text-rose-600";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-5 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto shadow-2xl w-full sm:w-[650px] sm:max-w-full p-4 sm:p-6 relative animate-modal-in" id="listing-form-modal">
                <Button type="button" variant="ghost" size="icon" onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                    <X size={18} />
                </Button>

                <h2 className="mb-1 pr-10 text-xl font-semibold text-slate-950">{isEdit ? 'Sửa tin đăng' : 'Đăng phòng trọ mới'}</h2>
                <p className="mb-5 text-sm text-slate-500">Điền thông tin chính xác để người thuê dễ đánh giá chỗ ở.</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                        {/* Title */}
                        <div className="col-span-2 max-sm:col-span-1 flex flex-col gap-1">
                            <label htmlFor="form-title" className={labelCls}>Tiêu đề *</label>
                            <input {...register('title')} className={inputCls} placeholder="VD: Phòng trọ cao cấp gần ĐH Bách Khoa" id="form-title" />
                            {errors.title && <span className={errorCls}>{errors.title.message}</span>}
                        </div>

                        {/* Images */}
                        <div className="col-span-2 max-sm:col-span-1 flex flex-col gap-1">
                            <label className={labelCls}>Hình ảnh phòng trọ (Tối đa 10)</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
                                {/* Previews for existing images */}
                                {existingImages.map((url, idx) => (
                                    <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                        <img src={url} alt="Room" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* Previews for new images */}
                                {previews.map((url, idx) => (
                                    <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                        <img src={url} alt="New upload" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* Add button */}
                                {(imageFiles.length + existingImages.length < 10) && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                                    >
                                        <Plus size={20} />
                                        <span className="text-[10px] mt-1 font-medium">Thêm ảnh</span>
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                        </div>

                        {/* Street */}
                        <div className="col-span-2 max-sm:col-span-1 flex flex-col gap-1">
                            <label htmlFor="form-street" className={labelCls}>Đường/Phố *</label>
                            <input {...register('street')} className={inputCls} placeholder="Số nhà, đường phố" id="form-street" />
                            {errors.street && <span className={errorCls}>{errors.street.message}</span>}
                        </div>

                        {/* Ward / District */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-ward" className={labelCls}>Phường/Xã</label>
                            <input {...register('ward')} className={inputCls} placeholder="Phường/Xã" id="form-ward" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-district" className={labelCls}>Quận/Huyện *</label>
                            <input {...register('district')} className={inputCls} placeholder="Quận/Huyện" id="form-district" />
                            {errors.district && <span className={errorCls}>{errors.district.message}</span>}
                        </div>

                        {/* City / Province */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-city" className={labelCls}>Thành phố *</label>
                            <input {...register('city')} className={inputCls} placeholder="Thành phố" id="form-city" />
                            {errors.city && <span className={errorCls}>{errors.city.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-province" className={labelCls}>Tỉnh/Thành phố *</label>
                            <input {...register('province')} className={inputCls} placeholder="Tỉnh/Thành phố" id="form-province" />
                            {errors.province && <span className={errorCls}>{errors.province.message}</span>}
                        </div>

                        {/* Lat / Lng */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-lat" className={labelCls}>Vĩ độ (Lat) *</label>
                            <input {...register('lat')} type="number" step="0.000001" className={inputCls} id="form-lat" />
                            {errors.lat && <span className={errorCls}>{errors.lat.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-lng" className={labelCls}>Kinh độ (Lng) *</label>
                            <input {...register('lng')} type="number" step="0.000001" className={inputCls} id="form-lng" />
                            {errors.lng && <span className={errorCls}>{errors.lng.message}</span>}
                        </div>

                        {/* Price / Area */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-price" className={labelCls}>Giá thuê (VNĐ/tháng) *</label>
                            <input {...register('price')} type="number" className={inputCls} placeholder="3000000" id="form-price" />
                            {errors.price && <span className={errorCls}>{errors.price.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-area" className={labelCls}>Diện tích (m²) *</label>
                            <input {...register('area')} type="number" step="0.1" className={inputCls} placeholder="25" id="form-area" />
                            {errors.area && <span className={errorCls}>{errors.area.message}</span>}
                        </div>

                        {/* Fees */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-electricity" className={labelCls}>Tiền điện (VNĐ/kWh)</label>
                            <input {...register('electricityFee')} type="number" className={inputCls} placeholder="3500" id="form-electricity" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-water" className={labelCls}>Tiền nước (VNĐ/m³)</label>
                            <input {...register('waterFee')} type="number" className={inputCls} placeholder="30000" id="form-water" />
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-contact-name" className={labelCls}>Tên liên hệ</label>
                            <input {...register('contactName')} className={inputCls} placeholder="Tên người liên hệ" id="form-contact-name" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="form-contact-phone" className={labelCls}>Số điện thoại</label>
                            <input {...register('contactPhone')} type="tel" className={inputCls} placeholder="0912345678" id="form-contact-phone" />
                        </div>

                        {/* Description */}
                        <div className="col-span-2 max-sm:col-span-1 flex flex-col gap-1">
                            <label htmlFor="form-description" className={labelCls}>Mô tả</label>
                            <textarea {...register('description')} className={`${inputCls} resize-y min-h-[80px]`} placeholder="Mô tả chi tiết về phòng trọ..." rows={3} id="form-description" />
                        </div>

                        {/* Utilities */}
                        <div className="col-span-2 max-sm:col-span-1 flex flex-col gap-1">
                            <label className={labelCls}>Tiện ích</label>
                            <div className="flex flex-wrap gap-1.5">
                                {UTILITY_OPTIONS.map((opt) => {
                                    const active = (utilities || []).includes(opt.value);
                                    return (
                                        <label key={opt.value} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border ${active ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                            <input type="checkbox" className="hidden" checked={active} onChange={() => handleUtilityToggle(opt.value)} />
                                            {opt.label}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">Hủy</Button>
                        <Button type="submit" disabled={isSubmitting || isUploading} variant="primary" className="w-full sm:w-auto" id="submit-listing-btn">
                            {(isSubmitting || isUploading) && <Loader2 size={16} className="animate-spin" />}
                            {isUploading ? 'Đang tải ảnh...' : isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Đăng tin'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
