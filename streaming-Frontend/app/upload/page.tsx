"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Other")
  const [tags, setTags] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      toast({
        title: "Please select a video file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("video", file)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", category)
      formData.append("tags", tags)

      const res = await fetch(`${API_URL}/api/videos/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      const data = await res.json()
      toast({
        title: "Video uploaded successfully!",
        description: "Your video is now live.",
      })
      router.push(`/video/${data.video._id}`)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload Video
          </CardTitle>
          <CardDescription>Share your content with the world</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="video">Video File</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your video a title"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                rows={5}
                maxLength={5000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tutorial, coding, javascript"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Uploading..." : "Upload Video"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
