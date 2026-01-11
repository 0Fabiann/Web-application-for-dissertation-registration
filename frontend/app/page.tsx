"use client"

/**
 * Main application page - handles SPA routing between different views
 */
import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { LandingPage } from "@/components/landing-page"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { StudentDashboard } from "@/components/student/student-dashboard"
import { ProfessorDashboard } from "@/components/professor/professor-dashboard"
import { Loader2 } from "lucide-react"

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, isLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState("landing")
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  // Handle initial auth check and redirect
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        setCurrentPage(user.role === "student" ? "student-dashboard" : "professor-dashboard")
      }
      setInitialCheckDone(true)
    }
  }, [user, isLoading])

  // Redirect when user logs in after initial load
  useEffect(() => {
    if (initialCheckDone && user) {
      setCurrentPage(user.role === "student" ? "student-dashboard" : "professor-dashboard")
    }
  }, [user, initialCheckDone])

  // Redirect to landing when user logs out
  useEffect(() => {
    if (initialCheckDone && !user && (currentPage === "student-dashboard" || currentPage === "professor-dashboard")) {
      setCurrentPage("landing")
    }
  }, [user, initialCheckDone, currentPage])

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Show loading screen during initial auth check
  if (!initialCheckDone) {
    return <LoadingScreen />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <LoginForm onNavigate={handleNavigate} />
      case "register":
        return <RegisterForm onNavigate={handleNavigate} />
      case "student-dashboard":
        return user?.role === "student" ? <StudentDashboard /> : <LandingPage onNavigate={handleNavigate} />
      case "professor-dashboard":
        return user?.role === "professor" ? <ProfessorDashboard /> : <LandingPage onNavigate={handleNavigate} />
      case "landing":
      default:
        return <LandingPage onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
      <main>{renderPage()}</main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
