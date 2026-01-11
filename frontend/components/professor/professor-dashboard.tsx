"use client"

/**
 * Professor dashboard main component
 */
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Users, FileText, Clock, Calendar, Plus, Loader2, AlertCircle } from "lucide-react"
import { SessionManager } from "./session-manager"
import { RequestReview } from "./request-review"
import { sessionsApi, requestsApi, type RegistrationSession, type CoordinationRequest } from "@/lib/api"
import type { Professor } from "@/lib/types"

export function ProfessorDashboard() {
  const { user } = useAuth()
  const professor = user as Professor
  const [activeTab, setActiveTab] = useState("overview")
  const [sessions, setSessions] = useState<RegistrationSession[]>([])
  const [requests, setRequests] = useState<CoordinationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch professor's sessions and requests from API
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [sessionsRes, requestsRes] = await Promise.all([
        sessionsApi.getMySessions(),
        requestsApi.getMyRequests()
      ])
      setSessions(sessionsRes.data.sessions)
      setRequests(requestsRes.data.requests)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const activeSessions = sessions.filter((s) => s.status === "active")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {professor?.name}</h1>
        <p className="text-muted-foreground">
          {professor?.department} | Coordinating {professor?.currentStudentCount} of {professor?.maxStudents} students
        </p>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <Card className="mb-6 border-warning bg-warning/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-foreground">
                    {pendingRequests.length} pending request{pendingRequests.length > 1 ? "s" : ""} awaiting review
                  </p>
                  <p className="text-sm text-muted-foreground">Students are waiting for your response.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setActiveTab("requests")}>
                Review Now
              </Button>
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
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeSessions.length}</p>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
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
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{professor?.currentStudentCount || 0}</p>
                <p className="text-sm text-muted-foreground">Students Coordinating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{requests.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Calendar className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <FileText className="h-4 w-4" />
            Requests
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Sessions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Active Sessions</CardTitle>
                  <CardDescription>Your current registration sessions</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("sessions")}>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </CardHeader>
              <CardContent>
                {activeSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No active sessions</p>
                    <Button onClick={() => setActiveTab("sessions")} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="p-4 rounded-lg bg-secondary/50">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-foreground text-sm">{session.title}</p>
                          <Badge className="bg-success text-success-foreground">Active</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {session.availableSlots} of {session.maxSlots} slots
                          </span>
                          <span>Ends: {new Date(session.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Requests</CardTitle>
                <CardDescription>Latest student coordination requests</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.slice(0, 4).map((request) => (
                      <div key={request.id} className="flex items-start justify-between p-4 rounded-lg bg-secondary/50">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground text-sm">{request.studentName}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{request.dissertationTopic}</p>
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
                    {requests.length > 4 && (
                      <Button variant="ghost" className="w-full" onClick={() => setActiveTab("requests")}>
                        View all requests
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManager />
        </TabsContent>

        <TabsContent value="requests">
          <RequestReview requests={requests} onRequestUpdate={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
