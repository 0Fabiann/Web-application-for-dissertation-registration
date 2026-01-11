"use client"

/**
 * Authentication context provider for managing user state across the application
 * Connects to the backend REST API for real authentication
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { User, Student, Professor, UserRole } from "./types"
import { authApi, setToken, removeToken, ApiError } from "./api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  department: string
  studentId?: string
  maxStudents?: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await authApi.getProfile()
          const userData = response.data.user
          // Convert to frontend User type
          const convertedUser = convertApiUser(userData)
          setUser(convertedUser)
        } catch (err) {
          // Token is invalid, remove it
          removeToken()
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  /**
   * Convert API user response to frontend User type
   */
  const convertApiUser = (apiUser: any): User => {
    const baseUser = {
      id: apiUser.id,
      email: apiUser.email,
      name: apiUser.name,
      role: apiUser.role as UserRole,
      createdAt: new Date(apiUser.createdAt),
    }

    if (apiUser.role === "student") {
      return {
        ...baseUser,
        role: "student" as const,
        studentId: apiUser.studentId || "",
        department: apiUser.department,
        approvedProfessorId: apiUser.approvedProfessorId,
      } as Student
    } else {
      return {
        ...baseUser,
        role: "professor" as const,
        department: apiUser.department,
        maxStudents: apiUser.maxStudents || 5,
        currentStudentCount: apiUser.currentStudentCount || 0,
      } as Professor
    }
  }

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authApi.login({ email, password })

      // Store token
      setToken(response.data.token)

      // Convert and set user
      const convertedUser = convertApiUser(response.data.user)
      setUser(convertedUser)

      setIsLoading(false)
      return true
    } catch (err) {
      setIsLoading(false)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
      return false
    }
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        department: data.department,
        studentId: data.studentId,
        maxStudents: data.maxStudents,
      })

      // Store token
      setToken(response.data.token)

      // Convert and set user
      const convertedUser = convertApiUser(response.data.user)
      setUser(convertedUser)

      setIsLoading(false)
      return true
    } catch (err) {
      setIsLoading(false)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
      return false
    }
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
