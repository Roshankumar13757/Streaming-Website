"use client"

import { useRef, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"

interface VideoPlayerProps {
  videoId: string
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const videoSrc = `${API_URL}/api/videos/${videoId}/stream`

  const handleLoadedData = () => {
    setLoading(false)
    setError(null)
  }

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setLoading(false)
    const video = e.currentTarget
    let errorMessage = "Failed to load video"
    
    if (video.error) {
      switch (video.error.code) {
        case video.error.MEDIA_ERR_ABORTED:
          errorMessage = "Video loading was aborted"
          break
        case video.error.MEDIA_ERR_NETWORK:
          errorMessage = "Network error while loading video"
          break
        case video.error.MEDIA_ERR_DECODE:
          errorMessage = "Video decoding error"
          break
        case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Video format not supported"
          break
      }
    }
    
    setError(errorMessage)
    console.error("Video error:", video.error)
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Spinner className="h-8 w-8 text-white" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 p-4">
          <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
          <p className="text-center text-sm text-white">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              if (videoRef.current) {
                videoRef.current.load()
              }
            }}
            className="mt-4 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        className="h-full w-full"
        controls
        preload="metadata"
        onLoadedData={handleLoadedData}
        onError={handleError}
        onLoadStart={() => setLoading(true)}
        src={videoSrc}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
