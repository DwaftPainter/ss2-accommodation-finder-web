import { Star, MapPin } from "lucide-react"

interface ListingCardProps {
  title: string
  location: string
  price: number
  rating: number
  image: string
}

export function ListingCard({ title, location, price, rating, image }: ListingCardProps) {
  return (
    <div className="flex gap-4 bg-card rounded-xl p-3">
      <img
        src={image}
        alt={title}
        className="w-24 h-24 shrink-0 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="size-3" />
          {location}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-semibold">
            {price.toLocaleString()}d
            <span className="font-normal text-muted-foreground">/dem</span>
          </p>
          <span className="flex items-center gap-1 text-xs">
            <Star className="size-3 fill-foreground" />
            {rating}
          </span>
        </div>
      </div>
    </div>
  )
}
