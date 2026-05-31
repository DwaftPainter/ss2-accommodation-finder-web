import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Save, ArrowLeft, Loader2, User as UserIcon, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { userApi } from "../services/api/user";
import { useAuth } from "../hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, FormField, Input, PageHeader, SectionContainer } from "@/components/ui";

const profileSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    phone: z.string().optional().or(z.literal("")),
    avatarUrl: z.string().url("URL ảnh không hợp lệ").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            phone: user?.phone || "",
            avatarUrl: user?.avatarUrl || "",
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name || "",
                phone: user.phone || "",
                avatarUrl: user.avatarUrl || "",
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            setIsLoading(true);
            const updatedUser = await userApi.updateMe(data);
            updateProfile(updatedUser);
            toast.success("Cập nhật thông tin thành công!");
            reset(data);
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </header>

            <SectionContainer as="main" size="sm" className="py-6 sm:py-10">
                <Card className="overflow-hidden">
                    {/* Banner/Header */}
                    <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
                        <div className="absolute -bottom-10 sm:-bottom-12 left-4 sm:left-8 p-1 bg-white rounded-2xl shadow-md">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center relative group">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={40} className="text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <CardContent className="px-4 pb-6 pt-14 sm:px-8 sm:pb-8 sm:pt-16">
                        <PageHeader
                            className="mb-8"
                            title={user?.name || "Thông tin cá nhân"}
                            description={
                                <span className="flex min-w-0 items-center gap-1.5">
                                    <Mail size={14} />
                                    <span className="truncate">{user?.email}</span>
                                </span>
                            }
                        />

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    id="profile-name"
                                    label="Họ và tên"
                                    error={errors.name?.message}
                                    required
                                >
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <UserIcon size={16} />
                                        </div>
                                        <Input
                                            id="profile-name"
                                            {...register("name")}
                                            className="pl-10"
                                            placeholder="Nhập tên của bạn"
                                        />
                                    </div>
                                </FormField>

                                <FormField id="profile-phone" label="Số điện thoại" error={errors.phone?.message}>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Phone size={16} />
                                        </div>
                                        <Input
                                            id="profile-phone"
                                            {...register("phone")}
                                            className="pl-10"
                                            placeholder="Số điện thoại liên hệ"
                                        />
                                    </div>
                                </FormField>

                                <FormField
                                    id="profile-avatar"
                                    label="Link ảnh đại diện"
                                    error={errors.avatarUrl?.message}
                                    className="md:col-span-2"
                                >
                                    <Input
                                        id="profile-avatar"
                                        {...register("avatarUrl")}
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </FormField>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={!isDirty || isSubmitting || isLoading}
                                    variant="primary"
                                    className="w-full sm:w-auto"
                                >
                                    {(isSubmitting || isLoading) ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    <span>Lưu thay đổi</span>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Account Security Section */}
                <Card className="mt-6 p-4 sm:mt-8 sm:p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Bảo mật tài khoản</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-50">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Mật khẩu</p>
                                <p className="text-xs text-slate-500 mt-0.5">Thay đổi mật khẩu đăng nhập của bạn</p>
                            </div>
                            <Button type="button" variant="link" className="h-auto p-0">
                                Cập nhật
                            </Button>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Xác thực 2 yếu tố</p>
                                <p className="text-xs text-slate-500 mt-0.5">Tăng cường bảo mật cho tài khoản của bạn</p>
                            </div>
                            <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                </Card>
            </SectionContainer>
        </div>
    );
}
