import { Request } from 'express';

// Augment Express Request with authenticated user data
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    collegeId: string;
    role: 'STUDENT' | 'ADMIN';
  };
}

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Resume parsing result
export interface ResumeData {
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  experience: string;
  preferredRole: string;
}

// Team match result
export interface TeamMatchResult {
  userId: string;
  name: string;
  skills: string[];
  matchScore: number;
  complementarySkills: string[];
}
