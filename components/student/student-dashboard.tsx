"use client"

/**
 * Student dashboard main component
 */
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Clock, CheckCircle, Search, Plus } from "lucide-react"
import { mockSessions, mockRequests } from "@/lib/mock-data"
import { SessionBrowser } from "./session-browser"
import { StudentRequests } from "./student-requests"
import type { Student } from "@/lib/types"

export function StudentDashboard() {
  const { user } = useAuth()
  const student = user as Student
  const [activeTab, setActiveTab] = useState("overview")

  // Get student's requests
  const studentRequests = mockRequests.filter((r) => r.studentId === student?.id || r.studentName === student?.name)
  const pendingRequests = studentRequests.filter((r) => r.status === "pending")
  const approvedRequests = studentRequests.filter((r) => r.status === "approved")
  const hasApproval = approvedRequests.length > 0 || student?.approvedProfessorId

  // Get active sessions
  const activeSessions = mockSessions.filter((s) => s.status === "active" && s.availableSlots > 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {student?.name}</h1>
        <p className="text-muted-foreground">
          {student?.department} | Student ID: {student?.studentId}
        </p>
      </div>

      {/* Status Banner */}
      {hasApproval && (
        <Card className="mb-6 border-success bg-success/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-foreground">You have been approved for dissertation coordination!</p>
                <p className="text-sm text-muted-foreground">
                  Please upload your signed coordination request document.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{studentRequests.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{approvedRequests.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeSessions.length}</p>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Search className="h-4 w-4" />
            Browse Sessions
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <FileText className="h-4 w-4" />
            My Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Requests</CardTitle>
                <CardDescription>Your latest dissertation coordination requests</CardDescription>
              </CardHeader>
              <CardContent>
                {studentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No requests yet</p>
                    <Button onClick={() => setActiveTab("sessions")} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Browse Sessions
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-start justify-between p-4 rounded-lg bg-secondary/50">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground text-sm">{request.dissertationTopic}</p>
                          <p className="text-xs text-muted-foreground">{request.professorName}</p>
                        </div>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : request.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                    {studentRequests.length > 3 && (
                      <Button variant="ghost" className="w-full" onClick={() => setActiveTab("requests")}>
                        View all requests
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Sessions</CardTitle>
                <CardDescription>Active registration sessions you can apply to</CardDescription>
              </CardHeader>
              <CardContent>
                {activeSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active sessions available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="p-4 rounded-lg bg-secondary/50">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-foreground text-sm">{session.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {session.availableSlots} slots
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{session.professorName}</p>
                        <p className="text-xs text-muted-foreground">Ends: {session.endDate.toLocaleDateString()}</p>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab("sessions")}>
                      Browse all sessions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <SessionBrowser hasApproval={hasApproval} />
        </TabsContent>

        <TabsContent value="requests">
          <StudentRequests requests={studentRequests} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
