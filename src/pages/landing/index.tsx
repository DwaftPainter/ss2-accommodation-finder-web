import {
    FeaturedListings,
    FeaturesSection,
    Footer,
    HeroSection,
    LandingNavbar,
} from "./components";

interface LandingPageProps {
    onNavigateToMap: () => void;
    onOpenAuth: () => void;
}

export default function LandingPage({ onNavigateToMap, onOpenAuth }: LandingPageProps) {
    return (
        <div className="landing-page">
            <LandingNavbar onNavigateToMap={onNavigateToMap} onOpenAuth={onOpenAuth} />
            <HeroSection onNavigateToMap={onNavigateToMap} />
            <FeaturesSection />
            <FeaturedListings onNavigateToMap={onNavigateToMap} />
            <Footer />
        </div>
    );
}
