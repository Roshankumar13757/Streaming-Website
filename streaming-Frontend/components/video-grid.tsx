"use client"

import { useEffect, useState, Suspense } from "react"
import { VideoCard } from "@/components/video-card"
import { useSearchParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

interface Video {
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

function VideoGridContent() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    fetchVideos()
  }, [searchParams])

  async function fetchVideos() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      const search = searchParams.get("search")
      const category = searchParams.get("category")
      const sortBy = searchParams.get("sortBy")

      if (search) params.set("search", search)
      if (category && category !== "All") params.set("category", category)
      if (sortBy) params.set("sortBy", sortBy)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${API_URL}/api/videos?${params.toString()}`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const contentType = res.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await res.json()
          setVideos(data.videos)
        } else {
          setError("Backend server is not responding correctly")
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Backend connection timeout. Please ensure your backend is running at " + API_URL)
      } else {
        setError("Backend server is not available. Please ensure your backend is running at " + API_URL)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <h3 className="mb-2 font-semibold text-destructive">Connection Error</h3>
        <p className="mb-4 text-sm text-muted-foreground">{error}</p>
        <p className="text-xs text-muted-foreground">
          Expected API URL: <code className="rounded bg-muted px-2 py-1">{API_URL}</code>
        </p>
      </div>
    )
  }

  if (videos.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">No videos found. Be the first to upload!</div>
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  )
}

export function VideoGrid() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <VideoGridContent />
    </Suspense>
  )
}
