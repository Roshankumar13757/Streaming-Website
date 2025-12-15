"use client"

import { useEffect, useState } from "react"
import { VideoCard } from "@/components/video-card"
import { useAuth } from "@/components/auth-provider"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { History, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HistoryItem {
  _id: string
  videoId: {
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
  watchedAt: string
  watchDuration: number
  completed: boolean
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    if (user) {
      fetchHistory()
    }
  }, [user])

  async function fetchHistory() {
    try {
      const res = await fetch(`${API_URL}/api/history`, {
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        setHistory(data.history)
      } else if (res.status === 401) {
        // Not authenticated or session expired
        setHistory([])
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
      toast({
        title: "Failed to load history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function removeFromHistory(videoId: string) {
    try {
      const res = await fetch(`${API_URL}/api/history/${videoId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (res.ok) {
        setHistory(prev => prev.filter(item => item.videoId._id !== videoId))
        toast({
          title: "Removed from history",
        })
      }
    } catch (error) {
      toast({
        title: "Failed to remove from history",
        variant: "destructive",
      })
    }
  }

  async function clearAllHistory() {
    if (!confirm("Are you sure you want to clear all watch history?")) return

    try {
      const res = await fetch(`${API_URL}/api/history`, {
        method: "DELETE",
        credentials: "include"
      })

      if (res.ok) {
        setHistory([])
        toast({
          title: "History cleared",
        })
      }
    } catch (error) {
      toast({
        title: "Failed to clear history",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Watch History</h1>
          <p>Please sign in to view your watch history.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Watch History</h1>
        </div>
        {history.length > 0 && (
          <Button
            onClick={clearAllHistory}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-8 w-8" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8">
          <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No watch history</h2>
          <p className="text-muted-foreground">
            Videos you watch will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <div
              key={item._id}
              className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm"
            >
              <VideoCard video={item.videoId} />
              <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
                <span>
                  Watched{" "}
                  {new Date(item.watchedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <Button
                  onClick={() => removeFromHistory(item.videoId._id)}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}