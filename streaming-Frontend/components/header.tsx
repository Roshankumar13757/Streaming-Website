"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Video, Upload, User, LogOut, Search, Menu, X, Home, TrendingUp, History, Bookmark } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold transition-opacity hover:opacity-80">
            <div className="relative">
              <Video className="h-7 w-7 text-primary" />
              <div className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-primary"></div>
            </div>
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              StreamHub
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-2xl md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search videos, creators, categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-full border-border/50 bg-muted/50 pl-11 pr-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden md:flex">
                  <Link href="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/" className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        Home
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-videos" className="cursor-pointer">
                        <Video className="mr-2 h-4 w-4" />
                        My Videos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="hidden sm:flex">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </nav>
        </div>

        {/* Mobile Search Bar */}
        <div className="mb-4 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-full border-border/50 bg-muted/50 pl-10 pr-4"
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/40 py-4 md:hidden">
            {user ? (
              <div className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/upload" onClick={() => setMobileMenuOpen(false)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/my-videos" onClick={() => setMobileMenuOpen(false)}>
                    <Video className="mr-2 h-4 w-4" />
                    My Videos
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
