"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ThumbsUp, Trash2 } from "lucide-react"

interface Comment {
  _id: string
  text: string
  userId: {
    _id: string
    username: string
  }
  createdAt: string
  likes: number
  likedBy?: string[]
  replies: Comment[]
}

export function CommentSection({ videoId }: { videoId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    fetchComments()
  }, [videoId])

  async function fetchComments() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${API_URL}/api/comments/video/${videoId}`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const contentType = res.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await res.json()
          setComments(data.comments)
          
          // Track which comments the user has liked
          if (user && data.comments) {
            const likedSet = new Set<string>()
            data.comments.forEach((comment: Comment) => {
              if (comment.likedBy && comment.likedBy.includes(user.id)) {
                likedSet.add(comment._id)
              }
            })
            setLikedComments(likedSet)
          }
        }
      }
    } catch (error) {
      console.log("Failed to fetch comments - backend may not be available")
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${API_URL}/api/comments/video/${videoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: newComment }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const contentType = res.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          setNewComment("")
          fetchComments()
        }
      }
    } catch (error) {
      toast({
        title: "Failed to post comment",
        description: "Backend server may not be available",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        fetchComments()
      }
    } catch (error) {
      toast({
        title: "Failed to delete comment",
        description: "Backend server may not be available",
        variant: "destructive",
      })
    }
  }

  async function handleLikeComment(commentId: string) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${API_URL}/api/comments/${commentId}/like`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const contentType = res.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await res.json()
          
          // Update the comment likes count
          setComments(prevComments => 
            prevComments.map(comment => 
              comment._id === commentId 
                ? { ...comment, likes: data.likes }
                : comment
            )
          )
          
          // Update liked status
          setLikedComments(prev => {
            const newSet = new Set(prev)
            if (data.hasLiked) {
              newSet.add(commentId)
            } else {
              newSet.delete(commentId)
            }
            return newSet
          })
        }
      }
    } catch (error) {
      toast({
        title: "Failed to like comment",
        description: "Backend server may not be available",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-bold">{comments.length} Comments</h2>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6 space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setNewComment("")}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading || !newComment.trim()}>
              Comment
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg border border-border p-4 text-center text-sm text-muted-foreground">
          Please sign in to leave a comment
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                <span className="text-sm font-semibold text-primary">
                  {comment.userId.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{comment.userId.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed">{comment.text}</p>
                <div className="mt-2 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeComment(comment._id)}
                    className={`h-auto p-0 text-xs ${likedComments.has(comment._id) ? 'text-primary' : ''}`}
                  >
                    <ThumbsUp className={`mr-1 h-3 w-3 ${likedComments.has(comment._id) ? 'fill-current' : ''}`} />
                    {comment.likes}
                  </Button>
                  {user && comment.userId._id === user.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment._id)}
                      className="h-auto p-0 text-xs text-destructive"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
