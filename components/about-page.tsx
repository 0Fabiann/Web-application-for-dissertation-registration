"use client"

/**
 * About page component with information about the dissertation registration system
 */
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, Target, ArrowRight, CheckCircle, Building2, BookOpen } from "lucide-react"

interface AboutPageProps {
  onNavigate: (page: string) => void
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance mb-6">
              About DissertReg
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              A modern platform designed to simplify and streamline the dissertation coordination process between
              students and professors at academic institutions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Empowering Academic Excellence</h2>
              <p className="text-muted-foreground text-lg">
                We believe that the administrative burden of dissertation registration should never get in the way of
                academic achievement. Our platform eliminates paperwork chaos and creates a seamless digital workflow
                for everyone involved.
              </p>
              <ul className="space-y-3">
                {[
                  "Reduce administrative overhead by 70%",
                  "Real-time status tracking and notifications",
                  "Secure document management system",
                  "Transparent capacity and deadline management",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="text-center">
                  <Users className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-3xl font-bold">500+</CardTitle>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </CardHeader>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader className="text-center">
                  <BookOpen className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-3xl font-bold">1,200+</CardTitle>
                  <p className="text-sm text-muted-foreground">Dissertations Coordinated</p>
                </CardHeader>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader className="text-center">
                  <Building2 className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-3xl font-bold">15+</CardTitle>
                  <p className="text-sm text-muted-foreground">Departments</p>
                </CardHeader>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader className="text-center">
                  <GraduationCap className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-3xl font-bold">98%</CardTitle>
                  <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Who Benefits?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to serve the entire academic community involved in dissertation management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">For Students</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Students can easily browse available registration sessions, submit requests with their proposed
                  topics, and track the status of their applications in real-time.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    View all open registration sessions
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Submit coordination requests easily
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Upload required documents securely
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Track request status in real-time
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">For Professors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Professors can create and manage registration sessions, review student requests, and maintain control
                  over their supervision capacity.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Create registration sessions with deadlines
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Set student capacity limits
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Review and approve/reject requests
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Manage uploaded documents
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Simplify Your Process?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join DissertReg today and experience a more efficient dissertation registration workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => onNavigate("register")} className="gap-2">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate("landing")}
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">DissertReg</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A dissertation registration system for academic institutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
