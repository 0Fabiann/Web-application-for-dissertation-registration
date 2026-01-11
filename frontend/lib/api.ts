/**
 * API Service Layer
 * Handles all HTTP requests to the backend REST API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get the stored authentication token
 */
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Store the authentication token
 */
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token
 */
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Base fetch function with authentication and error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data
    );
  }

  return data;
}

/**
 * Upload file with authentication
 */
async function uploadFile<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Upload failed',
      response.status,
      data
    );
  }

  return data;
}

// ============================================================================
// Authentication API
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'professor';
  department: string;
  studentId?: string;
  maxStudents?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'professor';
  department: string;
  studentId?: string;
  maxStudents?: number;
  currentStudentCount?: number;
  approvedProfessorId?: string;
  createdAt: string;
}

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    return fetchApi('/auth/me');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; data: { user: User } }> => {
    return fetchApi('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// Sessions API
// ============================================================================

export interface RegistrationSession {
  id: string;
  professorId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'closed';
  maxSlots: number;
  availableSlots: number;
  professor?: User;
  requests?: CoordinationRequest[];
  createdAt: string;
}

export interface CreateSessionData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxSlots: number;
}

export const sessionsApi = {
  /**
   * Get all sessions with optional filters
   */
  getAll: async (params?: { status?: string; professorId?: string; search?: string }): Promise<{ success: boolean; data: { sessions: RegistrationSession[] } }> => {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return fetchApi(`/sessions${queryString}`);
  },

  /**
   * Get active sessions available for requests
   */
  getActive: async (): Promise<{ success: boolean; data: { sessions: RegistrationSession[] } }> => {
    return fetchApi('/sessions/active');
  },

  /**
   * Get session by ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: { session: RegistrationSession } }> => {
    return fetchApi(`/sessions/${id}`);
  },

  /**
   * Get professor's own sessions
   */
  getMySessions: async (): Promise<{ success: boolean; data: { sessions: RegistrationSession[] } }> => {
    return fetchApi('/sessions/professor/my');
  },

  /**
   * Create a new session (professors only)
   */
  create: async (data: CreateSessionData): Promise<{ success: boolean; data: { session: RegistrationSession } }> => {
    return fetchApi('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a session
   */
  update: async (id: string, data: Partial<CreateSessionData>): Promise<{ success: boolean; data: { session: RegistrationSession } }> => {
    return fetchApi(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a session
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchApi(`/sessions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Requests API
// ============================================================================

export interface CoordinationRequest {
  id: string;
  studentId: string;
  professorId: string;
  sessionId: string;
  dissertationTopic: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'document_pending' | 'completed';
  rejectionReason?: string;
  student?: User;
  professor?: User;
  session?: RegistrationSession;
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestData {
  sessionId: string;
  dissertationTopic: string;
  message?: string;
}

export interface RequestStats {
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  total: number;
}

export const requestsApi = {
  /**
   * Get user's requests (student's own or professor's received)
   */
  getMyRequests: async (status?: string): Promise<{ success: boolean; data: { requests: CoordinationRequest[] } }> => {
    const queryString = status ? `?status=${status}` : '';
    return fetchApi(`/requests${queryString}`);
  },

  /**
   * Get request by ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: { request: CoordinationRequest } }> => {
    return fetchApi(`/requests/${id}`);
  },

  /**
   * Get request statistics
   */
  getStats: async (): Promise<{ success: boolean; data: { stats: RequestStats } }> => {
    return fetchApi('/requests/stats');
  },

  /**
   * Create a new request (students only)
   */
  create: async (data: CreateRequestData): Promise<{ success: boolean; data: { request: CoordinationRequest } }> => {
    return fetchApi('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Approve a request (professors only)
   */
  approve: async (id: string): Promise<{ success: boolean; data: { request: CoordinationRequest } }> => {
    return fetchApi(`/requests/${id}/approve`, {
      method: 'PUT',
    });
  },

  /**
   * Reject a request (professors only)
   */
  reject: async (id: string, reason: string): Promise<{ success: boolean; data: { request: CoordinationRequest } }> => {
    return fetchApi(`/requests/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Cancel a request (students only)
   */
  cancel: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchApi(`/requests/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Documents API
// ============================================================================

export interface Document {
  id: string;
  requestId: string;
  uploadedBy: string;
  uploaderRole: 'student' | 'professor';
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: 'pending_review' | 'accepted' | 'rejected';
  rejectionReason?: string;
  uploader?: User;
  createdAt: string;
}

export const documentsApi = {
  /**
   * Upload a document
   */
  upload: async (requestId: string, file: File): Promise<{ success: boolean; data: { document: Document } }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', requestId);
    return uploadFile('/documents/upload', formData);
  },

  /**
   * Get documents for a request
   */
  getByRequest: async (requestId: string): Promise<{ success: boolean; data: { documents: Document[] } }> => {
    return fetchApi(`/documents/request/${requestId}`);
  },

  /**
   * Get download URL for a document
   */
  getDownloadUrl: (documentId: string): string => {
    const token = getToken();
    return `${API_BASE_URL}/documents/${documentId}/download?token=${token}`;
  },

  /**
   * Accept a document (professors only)
   */
  accept: async (id: string): Promise<{ success: boolean; data: { document: Document } }> => {
    return fetchApi(`/documents/${id}/accept`, {
      method: 'PUT',
    });
  },

  /**
   * Reject a document (professors only)
   */
  reject: async (id: string, reason: string): Promise<{ success: boolean; data: { document: Document } }> => {
    return fetchApi(`/documents/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },
};

// ============================================================================
// Users API
// ============================================================================

export const usersApi = {
  /**
   * Get all professors
   */
  getProfessors: async (): Promise<{ success: boolean; data: { professors: User[] } }> => {
    return fetchApi('/users/professors');
  },

  /**
   * Get professor's coordinated students
   */
  getMyStudents: async (): Promise<{ success: boolean; data: { students: User[] } }> => {
    return fetchApi('/users/my-students');
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: { user: User } }> => {
    return fetchApi(`/users/${id}`);
  },
};
