"use client"

/**
 * Main navigation component with responsive mobile menu
 */
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GraduationCap, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react"

interface NavigationProps {
  onNavigate: (page: string) => void
  currentPage: string
}

export function Navigation({ onNavigate, currentPage }: NavigationProps) {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavigation = (page: string) => {
    onNavigate(page)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    onNavigate("landing")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button onClick={() => handleNavigation("landing")} className="flex items-center gap-2 font-semibold text-lg">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-foreground">DissertReg</span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {!user && (
            <button
              onClick={() => handleNavigation("landing")}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === "landing" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </button>
          )}

          {user && (
            <button
              onClick={() => handleNavigation(user.role === "student" ? "student-dashboard" : "professor-dashboard")}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage.includes("dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </button>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Button variant="ghost" onClick={() => handleNavigation("login")}>
                Log in
              </Button>
              <Button onClick={() => handleNavigation("register")}>Sign up</Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <User className="h-4 w-4" />
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() =>
                    handleNavigation(user.role === "student" ? "student-dashboard" : "professor-dashboard")
                  }
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {!user && (
              <>
                <button
                  onClick={() => handleNavigation("landing")}
                  className="block w-full text-left py-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  Home
                </button>
                <div className="pt-3 border-t border-border space-y-2">
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => handleNavigation("login")}>
                    Log in
                  </Button>
                  <Button className="w-full" onClick={() => handleNavigation("register")}>
                    Sign up
                  </Button>
                </div>
              </>
            )}

            {user && (
              <>
                <div className="py-2 text-sm font-medium text-muted-foreground">Signed in as {user.name}</div>
                <button
                  onClick={() =>
                    handleNavigation(user.role === "student" ? "student-dashboard" : "professor-dashboard")
                  }
                  className="block w-full text-left py-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  Dashboard
                </button>
                <div className="pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive bg-transparent"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
