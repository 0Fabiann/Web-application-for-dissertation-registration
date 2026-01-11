"use client"

/**
 * Component displaying student's coordination requests and their status
 * Uses real backend API for document uploads
 */
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, CheckCircle, XCircle, Upload, FileText, Calendar, MessageSquare, Loader2, AlertCircle } from "lucide-react"
import { documentsApi, type CoordinationRequest } from "@/lib/api"

interface StudentRequestsProps {
  requests: CoordinationRequest[]
  onRequestUpdate?: () => void
}

export function StudentRequests({ requests, onRequestUpdate }: StudentRequestsProps) {
  const [selectedRequest, setSelectedRequest] = useState<CoordinationRequest | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const getStatusIcon = (status: CoordinationRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-warning" />
      case "approved":
        return <CheckCircle className="h-5 w-5 text-success" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "document_pending":
        return <Upload className="h-5 w-5 text-primary" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-success" />
    }
  }

  const getStatusBadge = (status: CoordinationRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            Pending
          </Badge>
        )
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "document_pending":
        return <Badge variant="outline">Document Required</Badge>
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>
    }
  }

  const handleFileUpload = async (requestId: string) => {
    if (!uploadedFile) return

    setIsUploading(true)
    setUploadError(null)
    try {
      await documentsApi.upload(requestId, uploadedFile)
      setUploadDialogOpen(false)
      onRequestUpdate?.()
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload document")
    } finally {
      setIsUploading(false)
      setUploadedFile(null)
      setSelectedRequest(null)
    }
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Requests Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You haven&apos;t submitted any coordination requests yet. Browse available sessions to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getStatusIcon(request.status)}
                <div>
                  <CardTitle className="text-lg">{request.dissertationTopic}</CardTitle>
                  <CardDescription className="mt-1">
                    {request.professor?.name || "Professor"} | {request.session?.title || "Session"}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{request.message}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated: {new Date(request.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Rejection reason if rejected */}
              {request.status === "rejected" && request.rejectionReason && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-destructive mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Rejection Reason</p>
                      <p className="text-sm text-muted-foreground">{request.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload document button for approved requests */}
              {request.status === "approved" && (
                <Dialog
                  open={uploadDialogOpen && selectedRequest?.id === request.id}
                  onOpenChange={(open) => {
                    setUploadDialogOpen(open)
                    if (open) setSelectedRequest(request)
                    else {
                      setSelectedRequest(null)
                      setUploadedFile(null)
                      setUploadError(null)
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Signed Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Coordination Document</DialogTitle>
                      <DialogDescription>Upload your signed dissertation coordination request form.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                          <Label htmlFor={`file-upload-${request.id}`} className="cursor-pointer">
                            <span className="text-primary hover:underline">Click to upload</span>
                            <span className="text-muted-foreground"> or drag and drop</span>
                          </Label>
                          <Input
                            id={`file-upload-${request.id}`}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                          />
                          <p className="text-xs text-muted-foreground mt-2">PDF, DOC up to 10MB</p>
                        </div>
                        {uploadedFile && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground flex-1">{uploadedFile.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                              Remove
                            </Button>
                          </div>
                        )}
                        {uploadError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{uploadError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => handleFileUpload(request.id)} disabled={!uploadedFile || isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Document"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
