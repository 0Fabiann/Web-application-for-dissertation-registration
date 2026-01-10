/**
 * Core type definitions for the Dissertation Registration System
 */

export type UserRole = "student" | "professor"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
}

export interface Student extends User {
  role: "student"
  studentId: string
  department: string
  approvedProfessorId?: string
}

export interface Professor extends User {
  role: "professor"
  department: string
  maxStudents: number
  currentStudentCount: number
}

export type SessionStatus = "upcoming" | "active" | "closed"

export interface RegistrationSession {
  id: string
  professorId: string
  professorName: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  status: SessionStatus
  maxSlots: number
  availableSlots: number
}

export type RequestStatus = "pending" | "approved" | "rejected" | "document_pending" | "completed"

export interface CoordinationRequest {
  id: string
  studentId: string
  studentName: string
  professorId: string
  professorName: string
  sessionId: string
  sessionTitle: string
  dissertationTopic: string
  message: string
  status: RequestStatus
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface UploadedDocument {
  id: string
  requestId: string
  uploadedBy: string
  uploaderRole: UserRole
  fileName: string
  fileUrl: string
  uploadedAt: Date
  status: "pending_review" | "accepted" | "rejected"
  rejectionReason?: string
}
