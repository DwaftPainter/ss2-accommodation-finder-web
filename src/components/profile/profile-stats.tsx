import React from "react"
import { Star, Home, Clock } from "lucide-react"

interface ProfileStatsProps {
  rating: number
  listingsCount: number
  responseTime: string
}

export function ProfileStats({ rating, listingsCount, responseTime }: ProfileStatsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card rounded-xl p-4 text-center">
        <Star className="size-5 fill-amber-400 text-amber-400 mx-auto mb-1" />
        <p className="text-lg font-bold">{rating}</p>
        <p className="text-xs text-muted-foreground">Danh gia</p>
      </div>
      <div className="bg-card rounded-xl p-4 text-center">
        <Home className="size-5 text-primary mx-auto mb-1" />
        <p className="text-lg font-bold">{listingsCount}</p>
        <p className="text-xs text-muted-foreground">Cho o</p>
      </div>
      <div className="bg-card rounded-xl p-4 text-center">
        <Clock className="size-5 text-primary mx-auto mb-1" />
        <p className="text-lg font-bold">{responseTime}</p>
        <p className="text-xs text-muted-foreground">Phan hoi</p>
      </div>
    </div>
  )
}
