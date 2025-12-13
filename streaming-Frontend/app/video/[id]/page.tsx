import { VideoPlayer } from "@/components/video-player"
import { VideoDetails } from "@/components/video-details"
import { CommentSection } from "@/components/comment-section"

export default function VideoPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VideoPlayer videoId={params.id} />
          <VideoDetails videoId={params.id} />
          <CommentSection videoId={params.id} />
        </div>
        <div className="lg:col-span-1">
          <h3 className="mb-4 font-semibold">Related Videos</h3>
          {/* Related videos would go here */}
        </div>
      </div>
    </div>
  )
}
