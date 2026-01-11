"use client"

/**
 * Component for professors to review and respond to coordination requests
 */
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle, XCircle, MessageSquare, Calendar, FileText, ThumbsUp, ThumbsDown, AlertCircle, Loader2 } from "lucide-react"
import { requestsApi, type CoordinationRequest } from "@/lib/api"

interface RequestReviewProps {
  requests: CoordinationRequest[]
  onRequestUpdate?: () => void
}

export function RequestReview({ requests, onRequestUpdate }: RequestReviewProps) {
  const [selectedRequest, setSelectedRequest] = useState<CoordinationRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [actionError, setActionError] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const approvedRequests = requests.filter((r) => r.status === "approved")
  const rejectedRequests = requests.filter((r) => r.status === "rejected")

  const filteredRequests = filterStatus === "all" ? requests : requests.filter((r) => r.status === filterStatus)

  const handleApprove = async (request: CoordinationRequest) => {
    setIsProcessing(true)
    setActionError(null)
    try {
      await requestsApi.approve(request.id)
      onRequestUpdate?.()
    } catch (err: any) {
      setActionError(err.message || "Failed to approve request")
    } finally {
      setIsProcessing(false)
      setSelectedRequest(null)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!rejectionReason) return
    setIsProcessing(true)
    setActionError(null)
    try {
      await requestsApi.reject(requestId, rejectionReason)
      onRequestUpdate?.()
      setRejectDialogOpen(false)
    } catch (err: any) {
      setActionError(err.message || "Failed to reject request")
    } finally {
      setIsProcessing(false)
      setRejectionReason("")
      setSelectedRequest(null)
    }
  }

  const getStatusIcon = (status: CoordinationRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-warning" />
      case "approved":
        return <CheckCircle className="h-5 w-5 text-success" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: CoordinationRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            Pending Review
          </Badge>
        )
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:border-warning transition-colors"
          onClick={() => setFilterStatus("pending")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-success transition-colors"
          onClick={() => setFilterStatus("approved")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-foreground">{approvedRequests.length}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-destructive transition-colors"
          onClick={() => setFilterStatus("rejected")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-foreground">{rejectedRequests.length}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Requests Found</h3>
            <p className="text-muted-foreground">
              {filterStatus === "all"
                ? "You haven't received any coordination requests yet."
                : `No ${filterStatus} requests to display.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">{request.student?.name || "Student"}</CardTitle>
                      <CardDescription className="mt-1">{request.session?.title || "Registration Session"}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Proposed Topic</p>
                    <p className="text-sm text-muted-foreground">{request.dissertationTopic}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Student Message</p>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {actionError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{actionError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Rejection reason display */}
                  {request.status === "rejected" && request.rejectionReason && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Your Response</p>
                          <p className="text-sm text-muted-foreground">{request.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons for pending requests */}
                  {request.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="gap-2 bg-success hover:bg-success/90"
                        onClick={() => handleApprove(request)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="h-4 w-4" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Dialog open={rejectDialogOpen && selectedRequest?.id === request.id} onOpenChange={(open) => {
                        setRejectDialogOpen(open)
                        if (open) setSelectedRequest(request)
                        else {
                          setSelectedRequest(null)
                          setRejectionReason("")
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="gap-2" disabled={isProcessing}>
                            <ThumbsDown className="h-4 w-4" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Request</DialogTitle>
                            <DialogDescription>
                              Provide feedback to help {request.student?.name || "the student"} improve their proposal.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="rejection-reason">Rejection Reason</Label>
                            <Textarea
                              id="rejection-reason"
                              placeholder="Explain why this request cannot be approved..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={4}
                              className="mt-2"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                              disabled={!rejectionReason || isProcessing}
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Rejecting...
                                </>
                              ) : (
                                "Confirm Rejection"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
