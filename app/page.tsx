"use client"

/**
 * Main application page - handles SPA routing between different views
 */
import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { LandingPage } from "@/components/landing-page"
import { AboutPage } from "@/components/about-page"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { StudentDashboard } from "@/components/student/student-dashboard"
import { ProfessorDashboard } from "@/components/professor/professor-dashboard"

function AppContent() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState("landing")

  // Redirect to appropriate dashboard when user logs in
  useEffect(() => {
    if (user) {
      setCurrentPage(user.role === "student" ? "student-dashboard" : "professor-dashboard")
    }
  }, [user])

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <LoginForm onNavigate={handleNavigate} />
      case "register":
        return <RegisterForm onNavigate={handleNavigate} />
      case "about":
        return <AboutPage onNavigate={handleNavigate} />
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
