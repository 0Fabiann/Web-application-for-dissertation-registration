"use client"

/**
 * Authentication context provider for managing user state across the application
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User, Student, Professor, UserRole } from "./types"
import { mockStudents, mockProfessors } from "./mock-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  department: string
  studentId?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, _password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock authentication - in production, this would call a real API
    if (role === "student") {
      const student = mockStudents.find((s) => s.email === email) || {
        id: `student-${Date.now()}`,
        email,
        name: email
          .split("@")[0]
          .replace(".", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        role: "student" as const,
        studentId: `STU-${Date.now()}`,
        department: "Computer Science",
        createdAt: new Date(),
      }
      setUser(student as Student)
    } else {
      const professor = mockProfessors.find((p) => p.email === email) || {
        id: `prof-${Date.now()}`,
        email,
        name: `Dr. ${email
          .split("@")[0]
          .replace(".", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())}`,
        role: "professor" as const,
        department: "Computer Science",
        maxStudents: 5,
        currentStudentCount: 0,
        createdAt: new Date(),
      }
      setUser(professor as Professor)
    }

    setIsLoading(false)
    return true
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock registration - in production, this would call a real API
    if (data.role === "student") {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: "student",
        studentId: data.studentId || `STU-${Date.now()}`,
        department: data.department,
        createdAt: new Date(),
      }
      setUser(newStudent)
    } else {
      const newProfessor: Professor = {
        id: `prof-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: "professor",
        department: data.department,
        maxStudents: 5,
        currentStudentCount: 0,
        createdAt: new Date(),
      }
      setUser(newProfessor)
    }

    setIsLoading(false)
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
