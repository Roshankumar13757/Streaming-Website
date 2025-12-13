"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const contentType = res.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await res.json()
          setUser(data.user)
        }
      }
    } catch (error) {
      console.log("Backend not available - continuing without auth")
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const contentType = res.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Backend server is not responding. Please ensure your backend is running.")
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Login failed")
      }

      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Backend server connection timeout. Please ensure your backend is running.")
        }
        throw error
      }
      throw new Error("Backend server is not responding. Please ensure your backend is running.")
    }
  }

  async function register(username: string, email: string, password: string) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const contentType = res.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Backend server is not responding. Please ensure your backend is running.")
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Registration failed")
      }

      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Backend server connection timeout. Please ensure your backend is running.")
        }
        throw error
      }
      throw new Error("Backend server is not responding. Please ensure your backend is running.")
    }
  }

  async function logout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.log("Logout failed, clearing local state")
    }
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
