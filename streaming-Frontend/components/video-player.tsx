"use client"

import { useRef } from "react"

interface VideoPlayerProps {
  videoId: string
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
      <video ref={videoRef} className="h-full w-full" controls src={`${API_URL}/api/videos/${videoId}/stream`}>
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
