import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, ThumbsUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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
      <Card className="group overflow-hidden transition-all hover:ring-2 hover:ring-primary">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {video.thumbnail ? (
            <img
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <span className="text-4xl font-bold text-muted-foreground">{video.title.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
            {video.category}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 font-semibold text-pretty leading-snug">{video.title}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{video.description}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">{video.uploadedBy.username}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {video.views}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {video.likes}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
