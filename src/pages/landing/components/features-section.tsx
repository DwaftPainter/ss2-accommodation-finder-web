import { useEffect, useRef, useState } from "react";
import { Clock, Compass, DollarSign, Headphones } from "lucide-react";

const features = [
    {
        icon: <Compass size={24} />,
        title: "Tìm trọ gần đây",
        desc: "Tìm phòng trọ quanh vị trí hiện tại cho bạn.",
        color: "#10b981",
        bg: "#ecfdf5",
    },
    {
        icon: <DollarSign size={24} />,
        title: "Lọc theo giá",
        desc: "Dễ dàng tìm kiếm phòng trọ theo ngân sách.",
        color: "#3b82f6",
        bg: "#eff6ff",
    },
    {
        icon: <Clock size={24} />,
        title: "Phòng mới đăng",
        desc: "Xem những phòng trọ vừa được cập nhật.",
        color: "#f59e0b",
        bg: "#fffbeb",
    },
    {
        icon: <Headphones size={24} />,
        title: "Hỗ trợ tìm trọ",
        desc: "Chúng tôi sẵn sàng giúp bạn tìm được phòng.",
        color: "#8b5cf6",
        bg: "#f5f3ff",
    },
];

export function FeaturesSection() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.2 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="landing-features" id="features" ref={ref}>
            <div className="landing-features-grid">
                {features.map((feature, index) => (
                    <div
                        key={feature.title}
                        className={`landing-feature-card ${visible ? "visible" : ""}`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <div
                            className="landing-feature-icon"
                            style={{ background: feature.bg, color: feature.color }}
                        >
                            {feature.icon}
                        </div>
                        <h3 className="landing-feature-title">{feature.title}</h3>
                        <p className="landing-feature-desc">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
