import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, ThumbsUp, Play, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface VideoCardProps {
  video: {
    _id: string
    title: string
    description: string
    thumbnail: string
    views: number
    likes: number
    uploadDate: string
    uploadedBy: {
      _id: string
      username: string
    }
    category: string
  }
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/video/${video._id}`}>
      <Card className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10">
          {video.thumbnail ? (
            <>
              <img
                src={video.thumbnail || "/placeholder.svg"}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Play className="h-12 w-12 text-muted-foreground/50" />
                <span className="text-2xl font-bold text-muted-foreground/50">
                  {video.title.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="rounded-full bg-primary/90 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground" />
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-2 right-2 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            {video.category}
          </div>

          {/* Duration Badge (if available) */}
          <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Clock className="inline h-3 w-3" />
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 font-semibold leading-tight transition-colors group-hover:text-primary">
            {video.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{video.description}</p>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/20 text-xs text-primary">
                {video.uploadedBy.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium">{video.uploadedBy.username}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 transition-colors group-hover:text-foreground">
                <Eye className="h-3.5 w-3.5" />
                {video.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 transition-colors group-hover:text-foreground">
                <ThumbsUp className="h-3.5 w-3.5" />
                {video.likes.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
