"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

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
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={currentCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange(category)}
          className="whitespace-nowrap"
        >
          {category}
        </Button>
      ))}
    </div>
  )
}
