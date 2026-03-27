import { Star, MapPin, CheckCircle2, Settings } from "lucide-react"

interface ProfileHeaderProps {
  name: string
  avatar: string
  location: string
  isVerified: boolean
  rating: number
  reviewCount: number
}

export function ProfileHeader({ name, avatar, location, isVerified, rating, reviewCount }: ProfileHeaderProps) {
  return (
    <div className="bg-card rounded-2xl p-6 text-center">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <img
          src={avatar}
          alt={name}
          className="w-full h-full rounded-full object-cover border-4 border-background"
        />
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full">
            <CheckCircle2 className="size-4" />
          </div>
        )}
      </div>

      <h1 className="text-xl font-bold mb-1">{name}</h1>
      
      {isVerified && (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 mb-3">
          <CheckCircle2 className="size-3" />
          Da xac minh
        </span>
      )}

      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {location}
        </span>
        <span className="flex items-center gap-1">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          {rating} ({reviewCount})
        </span>
      </div>

      <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium">
        <Settings className="size-4" />
        Chinh sua
      </button>
    </div>
  )
}
