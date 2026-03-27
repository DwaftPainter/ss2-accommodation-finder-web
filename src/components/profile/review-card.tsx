import { Star } from "lucide-react"

interface ReviewCardProps {
  name: string
  avatar: string
  rating: number
  date: string
  content: string
}

export function ReviewCard({ name, avatar, rating, date, content }: ReviewCardProps) {
  return (
    <div className="bg-card rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={avatar}
          alt={name}
          className="w-9 h-9 shrink-0 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`size-3 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{content}</p>
    </div>
  )
}
