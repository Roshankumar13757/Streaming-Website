"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, TrendingUp, Clock, Eye, ThumbsUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

export function HeroBanner() {
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null)
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    fetchFeaturedContent()
  }, [])

  async function fetchFeaturedContent() {
    try {
      const [featuredRes, trendingRes] = await Promise.all([
        fetch(`${API_URL}/api/videos?sortBy=views&limit=1`),
        fetch(`${API_URL}/api/videos?sortBy=likes&limit=3`),
      ])

      if (featuredRes.ok) {
        const featuredData = await featuredRes.json()
        if (featuredData.videos && featuredData.videos.length > 0) {
          setFeaturedVideo(featuredData.videos[0])
        }
      }

      if (trendingRes.ok) {
        const trendingData = await trendingRes.json()
        setTrendingVideos(trendingData.videos || [])
      }
    } catch (error) {
      console.error("Error fetching featured content:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative h-[600px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!featuredVideo) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Featured Video Hero */}
      <div className="group relative h-[500px] w-full overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 shadow-2xl transition-all hover:shadow-primary/20 md:h-[600px]">
        {featuredVideo.thumbnail ? (
          <div className="absolute inset-0">
            <img
              src={featuredVideo.thumbnail}
              alt={featuredVideo.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/30 to-pink-500/30"></div>
        )}

        <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-12">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <TrendingUp className="h-4 w-4" />
              Featured Video
            </div>
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              {featuredVideo.title}
            </h1>
            <p className="line-clamp-2 text-base text-muted-foreground md:text-lg">
              {featuredVideo.description || "Watch this amazing content now!"}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {featuredVideo.views.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1.5">
                <ThumbsUp className="h-4 w-4" />
                {featuredVideo.likes.toLocaleString()} likes
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(featuredVideo.uploadDate), { addSuffix: true })}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {featuredVideo.category}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="group/btn">
                <Link href={`/video/${featuredVideo._id}`}>
                  <Play className="mr-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  Watch Now
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/profile/${featuredVideo.uploadedBy._id}`}>
                  By {featuredVideo.uploadedBy.username}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Videos Section */}
      {trendingVideos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/?sortBy=likes">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {trendingVideos.map((video) => (
              <Link key={video._id} href={`/video/${video._id}`}>
                <Card className="group overflow-hidden border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                        <Play className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                    <div className="absolute bottom-2 right-2 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                      #{trendingVideos.indexOf(video) + 1}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 line-clamp-2 font-semibold leading-tight">{video.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{video.uploadedBy.username}</span>
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
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

