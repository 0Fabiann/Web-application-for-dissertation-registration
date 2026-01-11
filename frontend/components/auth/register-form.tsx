"use client"

/**
 * Registration form component with role-specific fields
 */
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, BookOpen, Loader2, AlertCircle } from "lucide-react"
import type { UserRole } from "@/lib/types"

interface RegisterFormProps {
  onNavigate: (page: string) => void
}

const departments = [
  "Cybernetics",
  "Economic Informatics",
  "Economic Informatics (EN)",
  "Statistics",
]

export function RegisterForm({ onNavigate }: RegisterFormProps) {
  const { register, isLoading, error: authError, clearError } = useAuth()
  const [role, setRole] = useState<UserRole>("student")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [department, setDepartment] = useState("")
  const [studentId, setStudentId] = useState("")
  const [maxStudents, setMaxStudents] = useState("5")
  const [localError, setLocalError] = useState("")

  // Clear errors when fields change
  useEffect(() => {
    setLocalError("")
    clearError()
  }, [name, email, password, confirmPassword, department, studentId, maxStudents, role, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!name || !email || !password || !confirmPassword || !department) {
      setLocalError("Please fill in all required fields")
      return
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters")
      return
    }

    if (role === "student") {
      if (!studentId) {
        setLocalError("Please enter your student ID")
        return
      }
      if (!/^\d{8}$/.test(studentId)) {
        setLocalError("Student ID must be exactly 8 digits")
        return
      }
    }

    const success = await register({
      name,
      email,
      password,
      role,
      department,
      studentId: role === "student" ? studentId : undefined,
      maxStudents: role === "professor" ? parseInt(maxStudents) : undefined,
    })

    if (success) {
      // Navigation will happen automatically based on user role
    }
  }

  const displayError = localError || authError

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join the dissertation registration system</CardDescription>
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Student ID (8 characters)"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {role === "professor" && (
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Maximum Students to Coordinate</Label>
                <Select value={maxStudents} onValueChange={setMaxStudents} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maximum students" />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} students
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            {displayError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <button onClick={() => onNavigate("login")} className="text-primary hover:underline font-medium">
              Sign in
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
