"use client"

import { useRef, useState, useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"

interface VideoPlayerProps {
  videoId: string
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  const videoSrc = `${API_URL}/api/videos/${videoId}/stream`

  console.log("VideoPlayer rendering with videoId:", videoId);

  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [videoSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error occurred");
    setLoading(false);
    const video = e.currentTarget;
    let errorMessage = "Failed to load video";

    if (video.error) {
      switch (video.error.code) {
        case video.error.MEDIA_ERR_ABORTED:
          errorMessage = "Video loading was aborted";
          break;
        case video.error.MEDIA_ERR_NETWORK:
          errorMessage = "Network error while loading video";
          break;
        case video.error.MEDIA_ERR_DECODE:
          errorMessage = "Video decoding error - format may not be supported";
          break;
        case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Video format not supported";
          break;
        default:
          errorMessage = `Unknown video error (code: ${video.error.code})`;
      }
    }

    setError(errorMessage);
    console.error("Video error:", video.error, "Video src:", video.src);
  };

  const handleLoadStart = () => {
    console.log("Video load started");
    console.log("Video src:", videoRef.current?.src);
    setLoading(true);
  };

  const handleCanPlay = () => {
    console.log("Video can play");
    console.log("Video duration:", videoRef.current?.duration);
    console.log("Video readyState:", videoRef.current?.readyState);
    setLoading(false);
    setError(null);
    
    // Add video to watch history when it starts playing
    addToHistory();
  };

  const handleLoadedData = () => {
    console.log("Video loaded data");
    console.log("Video readyState:", videoRef.current?.readyState);
    setLoading(false);
    setError(null);
  };

  const addToHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/history/${videoId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchDuration: 0, // Could track actual watch time
          completed: false,
        }),
      });

      if (res.ok) {
        console.log("Added to watch history");
      }
    } catch (error) {
      console.log("Failed to add to history:", error);
    }
  };

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Spinner className="h-8 w-8 text-white" />
          <p className="text-white text-sm mt-2">Loading video...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 p-4">
          <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
          <p className="text-center text-sm text-white">{error}</p>
          <button
            onClick={() => {
              setError(null);
              if (videoRef.current) {
                videoRef.current.load();
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
        onError={handleError}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onWaiting={() => console.log("Video waiting")}
        onPlaying={() => console.log("Video playing")}
      >
        <source src={videoSrc} type="video/mp4" />
        <source src={videoSrc} type="video/webm" />
        <source src={videoSrc} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
