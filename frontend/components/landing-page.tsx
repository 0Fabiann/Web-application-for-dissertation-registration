"use client"

/**
 * Landing page component showcasing the dissertation registration system
 */
import { Button } from "@/components/ui/button"
import { GraduationCap, ArrowRight, BookOpen } from "lucide-react"

interface LandingPageProps {
  onNavigate: (page: string) => void
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-4 w-4" />
              Academic Excellence Made Simple
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance mb-6">
              Streamline Your Dissertation Registration Process
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Connect students with professors, manage coordination requests, and track your dissertation journey - all
              in one modern platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => onNavigate("register")} className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate("login")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple, streamlined process for both students and professors.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Students */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                For Students
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Browse Sessions",
                    desc: "Explore available registration sessions from professors in your department.",
                  },
                  {
                    step: 2,
                    title: "Submit Request",
                    desc: "Send a coordination request with your proposed dissertation topic.",
                  },
                  {
                    step: 3,
                    title: "Await Approval",
                    desc: "Track your request status and receive notification on approval.",
                  },
                  {
                    step: 4,
                    title: "Upload Documents",
                    desc: "Submit your signed dissertation coordination form for final approval.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Professors */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                For Professors
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Create Sessions",
                    desc: "Set up registration periods with your availability and capacity.",
                  },
                  { step: 2, title: "Review Requests", desc: "Evaluate student proposals and dissertation topics." },
                  {
                    step: 3,
                    title: "Approve or Reject",
                    desc: "Accept students within your limit or provide constructive feedback.",
                  },
                  {
                    step: 4,
                    title: "Finalize Coordination",
                    desc: "Review uploaded documents and confirm the coordination.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
