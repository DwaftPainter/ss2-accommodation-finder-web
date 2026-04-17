export default function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#13161f]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Đang tải...</p>
            </div>
        </div>
    );
}
