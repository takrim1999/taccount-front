"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, apiClient } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      apiClient
        .getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("auth_token")
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const response = await apiClient.login({ username, password })
    localStorage.setItem("auth_token", response.token)
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
  }

  const updateUser = async (userData: Partial<User>) => {
    const updatedUser = await apiClient.updateProfile(userData)
    setUser(updatedUser)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
