/**
 * Mock data for development and demonstration purposes
 */
import type { Student, Professor, RegistrationSession, CoordinationRequest, UploadedDocument } from "./types"

export const mockProfessors: Professor[] = [
  {
    id: "prof-1",
    email: "maria.ionescu@university.edu",
    name: "Dr. Maria Ionescu",
    role: "professor",
    department: "Computer Science",
    maxStudents: 5,
    currentStudentCount: 3,
    createdAt: new Date("2020-01-15"),
  },
  {
    id: "prof-2",
    email: "alexandru.popescu@university.edu",
    name: "Prof. Alexandru Popescu",
    role: "professor",
    department: "Software Engineering",
    maxStudents: 4,
    currentStudentCount: 2,
    createdAt: new Date("2019-09-01"),
  },
  {
    id: "prof-3",
    email: "elena.dumitrescu@university.edu",
    name: "Dr. Elena Dumitrescu",
    role: "professor",
    department: "Data Science",
    maxStudents: 6,
    currentStudentCount: 6,
    createdAt: new Date("2018-03-20"),
  },
]

export const mockStudents: Student[] = [
  {
    id: "student-1",
    email: "andrei.stan@student.edu",
    name: "Andrei Stan",
    role: "student",
    studentId: "STU-2024-001",
    department: "Computer Science",
    createdAt: new Date("2024-09-01"),
  },
  {
    id: "student-2",
    email: "ioana.marin@student.edu",
    name: "Ioana Marin",
    role: "student",
    studentId: "STU-2024-002",
    department: "Software Engineering",
    approvedProfessorId: "prof-1",
    createdAt: new Date("2024-09-01"),
  },
]

export const mockSessions: RegistrationSession[] = [
  {
    id: "session-1",
    professorId: "prof-1",
    professorName: "Dr. Maria Ionescu",
    title: "AI & Machine Learning Projects 2026",
    description:
      "Registration for dissertation projects in artificial intelligence, machine learning, and neural networks.",
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-02-15"),
    status: "active",
    maxSlots: 5,
    availableSlots: 2,
  },
  {
    id: "session-2",
    professorId: "prof-2",
    professorName: "Prof. Alexandru Popescu",
    title: "Web Technologies & Cloud Computing",
    description: "Projects focusing on modern web development, microservices, and cloud infrastructure.",
    startDate: new Date("2026-01-20"),
    endDate: new Date("2026-02-20"),
    status: "active",
    maxSlots: 4,
    availableSlots: 2,
  },
  {
    id: "session-3",
    professorId: "prof-3",
    professorName: "Dr. Elena Dumitrescu",
    title: "Big Data Analytics Projects",
    description: "Research projects in data analytics, visualization, and business intelligence.",
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-03-01"),
    status: "upcoming",
    maxSlots: 6,
    availableSlots: 0,
  },
]

export const mockRequests: CoordinationRequest[] = [
  {
    id: "req-1",
    studentId: "student-1",
    studentName: "Andrei Stan",
    professorId: "prof-1",
    professorName: "Dr. Maria Ionescu",
    sessionId: "session-1",
    sessionTitle: "AI & Machine Learning Projects 2026",
    dissertationTopic: "Deep Learning for Medical Image Analysis",
    message:
      "I am interested in applying convolutional neural networks for early detection of diseases in medical imaging.",
    status: "pending",
    createdAt: new Date("2026-01-16"),
    updatedAt: new Date("2026-01-16"),
  },
  {
    id: "req-2",
    studentId: "student-2",
    studentName: "Ioana Marin",
    professorId: "prof-1",
    professorName: "Dr. Maria Ionescu",
    sessionId: "session-1",
    sessionTitle: "AI & Machine Learning Projects 2026",
    dissertationTopic: "Natural Language Processing for Romanian Text",
    message: "I would like to develop NLP models specifically trained for the Romanian language.",
    status: "approved",
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-17"),
  },
  {
    id: "req-3",
    studentId: "student-1",
    studentName: "Andrei Stan",
    professorId: "prof-2",
    professorName: "Prof. Alexandru Popescu",
    sessionId: "session-2",
    sessionTitle: "Web Technologies & Cloud Computing",
    dissertationTopic: "Serverless Architecture for Real-time Applications",
    message: "Exploring serverless computing patterns for building scalable real-time web applications.",
    status: "rejected",
    rejectionReason:
      "The proposed topic overlaps significantly with an ongoing project. Please consider a different angle.",
    createdAt: new Date("2026-01-21"),
    updatedAt: new Date("2026-01-22"),
  },
]

export const mockDocuments: UploadedDocument[] = [
  {
    id: "doc-1",
    requestId: "req-2",
    uploadedBy: "student-2",
    uploaderRole: "student",
    fileName: "dissertation_request_ioana_marin.pdf",
    fileUrl: "/uploads/doc-1.pdf",
    uploadedAt: new Date("2026-01-18"),
    status: "pending_review",
  },
]
