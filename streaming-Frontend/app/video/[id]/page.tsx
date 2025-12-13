import { VideoPlayer } from "@/components/video-player"
import { VideoDetails } from "@/components/video-details"
import { CommentSection } from "@/components/comment-section"
import { RelatedVideos } from "@/components/related-videos"

export default async function VideoPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer videoId={id} />
          <VideoDetails videoId={id} />
          <CommentSection videoId={id} />
        </div>
        <div className="lg:col-span-1">
          <RelatedVideos currentVideoId={id} />
        </div>
      </div>
    </div>
  )
}
