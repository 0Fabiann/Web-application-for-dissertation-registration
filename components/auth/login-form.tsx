"use client"

import type React from "react"

/**
 * Login form component with role selection
 */
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, BookOpen, Loader2 } from "lucide-react"
import type { UserRole } from "@/lib/types"

interface LoginFormProps {
  onNavigate: (page: string) => void
}

export function LoginForm({ onNavigate }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const [role, setRole] = useState<UserRole>("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    const success = await login(email, password, role)
    if (success) {
      onNavigate(role === "student" ? "student-dashboard" : "professor-dashboard")
    } else {
      setError("Invalid credentials. Please try again.")
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="professor" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Professor
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={role === "student" ? "student@university.edu" : "professor@university.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground text-center">
            {"Don't have an account? "}
            <button onClick={() => onNavigate("register")} className="text-primary hover:underline font-medium">
              Sign up
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
