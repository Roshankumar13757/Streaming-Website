"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Sparkles } from "lucide-react"

const categories = ["All", "Gaming", "Music", "Education", "Entertainment", "Sports", "Technology", "Other"]

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || "All"

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === "All") {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-muted-foreground">Browse by Category</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={currentCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(category)}
            className={`whitespace-nowrap transition-all ${
              currentCategory === category
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "hover:bg-muted/50"
            }`}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  )
}
