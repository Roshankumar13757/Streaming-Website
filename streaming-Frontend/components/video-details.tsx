"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Eye, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Video {
  _id: string
  title: string
  description: string
  views: number
  likes: number
  uploadDate: string
  category: string
  uploadedBy: {
    _id: string
    username: string
  }
}

export function VideoDetails({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState<Video | null>(null)
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

      <div className="flex items-center justify-between border-y border-border py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <span className="font-semibold text-primary">{video.uploadedBy.username.charAt(0).toUpperCase()}</span>
          </div>
          <span className="font-semibold">{video.uploadedBy.username}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleLike} variant="outline" size="sm">
            <ThumbsUp className="mr-2 h-4 w-4" />
            {video.likes}
          </Button>
          {isOwner && (
            <Button onClick={handleDelete} variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
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
