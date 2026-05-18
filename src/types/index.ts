export type UserRole = 'student' | 'staff';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface UserModel {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  matricNumber?: string;
  staffId?: string;
}

// Course Types
export interface Course {
  id: string;
  code: string;
  title: string;
  lecturerId: string;
  lecturerName: string;
  description: string;
  students: string[]; // Array of student UIDs
  createdAt: string;
  updatedAt: string;
}

// Attendance Session Types
export interface AttendanceSession {
  id: string;
  courseId: string;
  courseName: string;
  createdBy: string; // Lecturer UID
  createdAt: string;
  expiresAt: string; // Timestamp when attendance marking closes
  status: 'active' | 'closed';
}

// Student Attendance Types
export interface StudentAttendance {
  id: string;
  sessionId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  markedAt: string;
  ipAddress?: string;
}

