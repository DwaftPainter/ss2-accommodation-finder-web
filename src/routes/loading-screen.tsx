import Loader from "@/components/ui/loading";

export default function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#13161f]">
            <Loader />
        </div>
    );
}
