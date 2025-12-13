"use client"

import { useEffect, useState } from "react"
import { VideoCard } from "@/components/video-card"
import { Spinner } from "@/components/ui/spinner"
import { Video } from "lucide-react"

interface RelatedVideo {
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

export function RelatedVideos({ currentVideoId, category }: { currentVideoId: string; category?: string }) {
  const [videos, setVideos] = useState<RelatedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [videoCategory, setVideoCategory] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    if (category) {
      setVideoCategory(category)
      fetchRelatedVideos(category)
    } else {
      fetchCurrentVideoCategory()
    }
  }, [currentVideoId, category])

  async function fetchCurrentVideoCategory() {
    try {
      const res = await fetch(`${API_URL}/api/videos/${currentVideoId}`)
      if (res.ok) {
        const data = await res.json()
        const cat = data.video?.category
        setVideoCategory(cat)
        fetchRelatedVideos(cat)
      } else {
        fetchRelatedVideos()
      }
    } catch (error) {
      console.error("Error fetching video category:", error)
      fetchRelatedVideos()
    }
  }

  async function fetchRelatedVideos(cat?: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (cat && cat !== "All") {
        params.set("category", cat)
      }
      params.set("limit", "8")
      params.set("sortBy", "views")

      const res = await fetch(`${API_URL}/api/videos?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        // Filter out the current video
        const filtered = (data.videos || []).filter((v: RelatedVideo) => v._id !== currentVideoId).slice(0, 5)
        setVideos(filtered)
      }
    } catch (error) {
      console.error("Error fetching related videos:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/30 p-6 text-center">
        <Video className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No related videos found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Related Videos</h3>
      <div className="space-y-3">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  )
}

