"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Eye, Trash2, Bookmark, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { SocialShare } from "@/components/social-share"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Video {
  _id: string
  title: string
  description: string
  views: number
  likes: number
  likedBy?: string[]
  uploadDate: string
  category: string
  uploadedBy: {
    _id: string
    username: string
  }
}

export function VideoDetails({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState<Video | null>(null)
  const [hasLiked, setHasLiked] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    fetchVideo()
  }, [videoId])

  async function fetchVideo() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${API_URL}/api/videos/${videoId}`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const contentType = res.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await res.json()
          setVideo(data.video)
          // Check if current user has liked this video
          if (user && data.video.likedBy) {
            setHasLiked(data.video.likedBy.includes(user.id))
          }
        }
      }
    } catch (error) {
      console.log("Failed to fetch video - backend may not be available")
    }
  }

  async function handleLike() {
    if (!user) {
      toast({
        title: "Please sign in to like videos",
        variant: "destructive",
      })
      return
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${API_URL}/api/videos/${videoId}/like`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const contentType = res.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await res.json()
          setVideo((prev) => (prev ? { ...prev, likes: data.likes } : null))
          setHasLiked(data.hasLiked)
        }
      }
    } catch (error) {
      toast({
        title: "Failed to like video",
        description: "Backend server may not be available",
        variant: "destructive",
      })
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${API_URL}/api/videos/${videoId}`, {
        method: "DELETE",
        credentials: "include",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        toast({
          title: "Video deleted successfully",
        })
        router.push("/")
      }
    } catch (error) {
      toast({
        title: "Failed to delete video",
        description: "Backend server may not be available",
        variant: "destructive",
      })
    }
  }

  if (!video) return <div>Loading...</div>

  const isOwner = user && video.uploadedBy._id === user.id

  return (
    <div className="mt-6 space-y-4">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-balance">{video.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {video.views} views
          </span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}</span>
          <span>•</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{video.category}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/20 text-primary">
              {video.uploadedBy.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{video.uploadedBy.username}</p>
            <p className="text-xs text-muted-foreground">Content Creator</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleLike}
            variant={hasLiked ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{video.likes.toLocaleString()}</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Save
          </Button>
          <SocialShare title={video.title} url={`/video/${video._id}`} description={video.description} />
          {isOwner && (
            <Button onClick={handleDelete} variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{video.description}</p>
      </div>
    </div>
  )
}
