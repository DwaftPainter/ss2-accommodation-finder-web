import { ProfileHeader } from "../components/profile/profile-header"
import { ProfileStats } from "../components/profile/profile-stats"
import { ListingCard } from "../components/profile/listing-card"
import { ReviewCard } from "../components/profile/review-card"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const user = {
  name: "Minh Anh Nguyen",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  location: "Ho Chi Minh, Viet Nam",
  isVerified: true,
  rating: 4.92,
  reviewCount: 156,
  bio: "Xin chao! Toi la Minh Anh, mot nguoi yeu thich du lich va chia se khong gian song. Toi da lam chu nha tren NestFinder duoc 4 nam.",
  listingsCount: 5,
  responseTime: "1h",
}

const listings = [
  {
    id: "1",
    title: "Can ho view song Sai Gon",
    location: "Quan 1, TP.HCM",
    price: 1200000,
    rating: 4.95,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
  },
  {
    id: "2",
    title: "Villa Da Lat",
    location: "Da Lat, Lam Dong",
    price: 2500000,
    rating: 4.88,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
  },
]

const reviews = [
  {
    id: "1",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    rating: 5,
    date: "Thang 2, 2026",
    content: "Cho o tuyet voi! Can ho rat sach se, view dep va chu nha rat than thien.",
  },
  {
    id: "2",
    name: "Emma Watson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    rating: 5,
    date: "Thang 1, 2026",
    content: "Villa o Da Lat that su la mot trai nghiem dang nho.",
  },
]

export default function ProfilePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ✅ thêm - Nút back về trang chủ */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Back
      </button>
      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        <ProfileHeader
          name={user.name}
          avatar={user.avatar}
          location={user.location}
          isVerified={user.isVerified}
          rating={user.rating}
          reviewCount={user.reviewCount}
        />

        <ProfileStats
          rating={user.rating}
          listingsCount={user.listingsCount}
          responseTime={user.responseTime}
        />

        <div className="bg-card rounded-2xl p-5">
          <h2 className="font-semibold mb-2">Gioi thieu</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Cho o ({listings.length})</h2>
          <div className="space-y-4">
            {listings.map((item) => (
              <ListingCard key={item.id} {...item} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Danh gia ({reviews.length})</h2>
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
