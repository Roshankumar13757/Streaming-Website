"use client"

import { useEffect, useState } from "react"
import { VideoCard } from "@/components/video-card"
import { useAuth } from "@/components/auth-provider"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Upload } from "lucide-react"

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

export default function MyVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    if (user) {
      fetchMyVideos()
    }
  }, [user])

  async function fetchMyVideos() {
    try {
      const res = await fetch(`${API_URL}/api/videos/user/${user!.id}`)
      if (res.ok) {
        const data = await res.json()
        setVideos(data.videos)
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Videos</h1>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload New
          </Link>
        </Button>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="mb-4 text-muted-foreground">You haven't uploaded any videos yet.</p>
          <Button asChild>
            <Link href="/upload">Upload Your First Video</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
