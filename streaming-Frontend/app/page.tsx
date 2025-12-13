import { VideoGrid } from "@/components/video-grid"
import { CategoryFilter } from "@/components/category-filter"
import { HeroBanner } from "@/components/hero-banner"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Banner Section */}
        <div className="mb-12">
          <HeroBanner />
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter />
        </div>

        {/* Video Grid Section */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Videos</h2>
          </div>
          <VideoGrid />
        </div>
      </main>
    </div>
  )
}
