import { VideoGrid } from "@/components/video-grid"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-6">
          <SearchBar />
          <CategoryFilter />
        </div>
        <VideoGrid />
      </div>
    </div>
  )
}
