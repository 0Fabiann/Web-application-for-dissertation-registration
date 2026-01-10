"use client"

/**
 * Component for browsing and applying to registration sessions
 */
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Calendar, Users, Clock, Send, CheckCircle, AlertCircle } from "lucide-react"
import { mockSessions } from "@/lib/mock-data"
import type { RegistrationSession } from "@/lib/types"

interface SessionBrowserProps {
  hasApproval: boolean
}

export function SessionBrowser({ hasApproval }: SessionBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSession, setSelectedSession] = useState<RegistrationSession | null>(null)
  const [dissertationTopic, setDissertationTopic] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const filteredSessions = mockSessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.professorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmitRequest = async () => {
    if (!dissertationTopic || !message) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setSubmitSuccess(true)

    // Reset form after 2 seconds
    setTimeout(() => {
      setSelectedSession(null)
      setDissertationTopic("")
      setMessage("")
      setSubmitSuccess(false)
    }, 2000)
  }

  const getStatusBadge = (status: RegistrationSession["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>
      case "closed":
        return <Badge variant="outline">Closed</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by professor or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Warning if already approved */}
      {hasApproval && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm text-foreground">
                You already have an approved coordination. You cannot be approved by another professor.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((session) => (
          <Card key={session.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg leading-tight">{session.title}</CardTitle>
                {getStatusBadge(session.status)}
              </div>
              <CardDescription>{session.professorName}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{session.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {session.startDate.toLocaleDateString()} - {session.endDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {session.availableSlots} of {session.maxSlots} slots available
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={session.status !== "active" || session.availableSlots === 0}
                    onClick={() => setSelectedSession(session)}
                  >
                    {session.status === "active" && session.availableSlots > 0
                      ? "Apply Now"
                      : session.status === "upcoming"
                        ? "Opens Soon"
                        : session.availableSlots === 0
                          ? "No Slots Available"
                          : "Closed"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  {submitSuccess ? (
                    <div className="py-8 text-center">
                      <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Request Submitted!</h3>
                      <p className="text-muted-foreground">
                        Your coordination request has been sent to {selectedSession?.professorName}.
                      </p>
                    </div>
                  ) : (
                    <>
                      <DialogHeader>
                        <DialogTitle>Submit Coordination Request</DialogTitle>
                        <DialogDescription>
                          Apply to {selectedSession?.professorName} for {selectedSession?.title}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="topic">Dissertation Topic</Label>
                          <Input
                            id="topic"
                            placeholder="Enter your proposed dissertation topic"
                            value={dissertationTopic}
                            onChange={(e) => setDissertationTopic(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message to Professor</Label>
                          <Textarea
                            id="message"
                            placeholder="Describe your interest in this topic and relevant background..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleSubmitRequest}
                          disabled={!dissertationTopic || !message || isSubmitting}
                          className="gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Clock className="h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Submit Request
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No sessions found matching your search.</p>
        </div>
      )}
    </div>
  )
}
