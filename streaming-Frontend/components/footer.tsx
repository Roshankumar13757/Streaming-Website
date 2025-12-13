"use client"

import Link from "next/link"
import { Video, Github, Twitter, Youtube, Instagram, Facebook, Mail, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: "Browse Videos", href: "/" },
      { name: "Upload Video", href: "/upload" },
      { name: "Categories", href: "/?category=All" },
      { name: "Trending", href: "/?sortBy=likes" },
    ],
    community: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
    creators: [
      { name: "Creator Dashboard", href: "/my-videos" },
      { name: "Analytics", href: "/analytics" },
      { name: "Monetization", href: "/monetization" },
      { name: "Help Center", href: "/help" },
    ],
  }

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "hover:text-blue-400" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com", color: "hover:text-pink-400" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com", color: "hover:text-red-400" },
    { name: "Facebook", icon: Facebook, href: "https://facebook.com", color: "hover:text-blue-500" },
    { name: "GitHub", icon: Github, href: "https://github.com", color: "hover:text-gray-300" },
  ]

  return (
    <footer className="relative mt-20 border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2 text-xl font-bold">
              <div className="relative">
                <Video className="h-7 w-7 text-primary" />
                <div className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-primary"></div>
              </div>
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                StreamHub
              </span>
            </Link>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              Your ultimate destination for streaming and sharing videos. Discover amazing content, connect with
              creators, and be part of a vibrant community.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Button
                    key={social.name}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={`h-10 w-10 rounded-full p-0 ${social.color} transition-colors`}
                  >
                    <Link href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name}>
                      <Icon className="h-5 w-5" />
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creators Links */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">For Creators</h3>
            <ul className="space-y-3">
              {footerLinks.creators.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 rounded-xl border border-border/50 bg-muted/30 p-6 md:p-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <h3 className="mb-2 text-lg font-semibold">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">
                Get the latest videos and updates delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full gap-2 md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-10 flex-1 rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-64"
              />
              <Button size="sm" className="whitespace-nowrap">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} StreamHub. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> for creators
          </div>
        </div>
      </div>
    </footer>
  )
}

