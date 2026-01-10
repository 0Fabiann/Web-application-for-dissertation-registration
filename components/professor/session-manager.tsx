"use client"

/**
 * Component for professors to manage their registration sessions
 */
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Calendar, Users, Plus, Edit, Trash2, CheckCircle } from "lucide-react"
import type { RegistrationSession } from "@/lib/types"

interface SessionManagerProps {
  sessions: RegistrationSession[]
}

export function SessionManager({ sessions }: SessionManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    maxSlots: 5,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleCreateSession = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setSubmitSuccess(true)

    setTimeout(() => {
      setIsCreateOpen(false)
      setSubmitSuccess(false)
      setNewSession({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        maxSlots: 5,
      })
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
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Registration Sessions</h2>
          <p className="text-sm text-muted-foreground">Manage your dissertation registration periods</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            {submitSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Session Created!</h3>
                <p className="text-muted-foreground">Your new registration session has been created successfully.</p>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create Registration Session</DialogTitle>
                  <DialogDescription>
                    Set up a new period for students to submit coordination requests.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Session Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., AI Research Projects 2026"
                      value={newSession.title}
                      onChange={(e) => setNewSession((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the types of projects and topics you're accepting..."
                      value={newSession.description}
                      onChange={(e) => setNewSession((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newSession.startDate}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newSession.endDate}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSlots">Maximum Students</Label>
                    <Input
                      id="maxSlots"
                      type="number"
                      min={1}
                      max={20}
                      value={newSession.maxSlots}
                      onChange={(e) =>
                        setNewSession((prev) => ({ ...prev, maxSlots: Number.parseInt(e.target.value) || 5 }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateSession}
                    disabled={!newSession.title || !newSession.startDate || !newSession.endDate || isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Session"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Sessions Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Create your first registration session to start accepting student coordination requests.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight">{session.title}</CardTitle>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{session.description}</p>
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
                      {session.maxSlots - session.availableSlots} accepted / {session.maxSlots} max
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${((session.maxSlots - session.availableSlots) / session.maxSlots) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{session.availableSlots} slots remaining</p>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
