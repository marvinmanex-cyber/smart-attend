import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  Timestamp,
  writeBatch,
  Query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course, AttendanceSession, StudentAttendance, UserModel } from "@/types";

export const FirestoreService = {
  // ===== 1. CREATE A COURSE =====
  async createCourse(
    lecturerId: string,
    lecturerName: string,
    code: string,
    title: string,
    description: string
  ): Promise<Course> {
    try {
      const courseId = `${code}_${Date.now()}`;
      const now = new Date().toISOString();

      const courseData: Course = {
        id: courseId,
        code,
        title,
        description,
        lecturerId,
        lecturerName,
        students: [],
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, "courses", courseId), courseData);
      return courseData;
    } catch (error) {
      console.error("Error creating course:", error);
      throw new Error("Failed to create course");
    }
  },

  // ===== 2. GET COURSES FOR A SPECIFIC LECTURER =====
  async getCoursesByLecturer(lecturerId: string): Promise<Course[]> {
    try {
      const q: Query = query(
        collection(db, "courses"),
        where("lecturerId", "==", lecturerId)
      );

      const querySnapshot = await getDocs(q);
      const courses: Course[] = [];

      querySnapshot.forEach((doc) => {
        courses.push(doc.data() as Course);
      });

      return courses;
    } catch (error) {
      console.error("Error fetching lecturer courses:", error);
      throw new Error("Failed to fetch courses");
    }
  },

  // ===== 3. ENROLL A STUDENT IN A COURSE =====
  async enrollStudentInCourse(courseId: string, studentId: string): Promise<void> {
    try {
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);

      if (!courseSnap.exists()) {
        throw new Error("Course not found");
      }

      const courseData = courseSnap.data() as Course;

      // Check if student already enrolled
      if (courseData.students.includes(studentId)) {
        throw new Error("Student is already enrolled in this course");
      }

      // Add student to course
      await updateDoc(courseRef, {
        students: arrayUnion(studentId),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error enrolling student:", error);
      throw error;
    }
  },

  // ===== 4. CREATE AN ATTENDANCE SESSION WITH EXPIRY =====
  async createAttendanceSession(
    courseId: string,
    courseName: string,
    lecturerId: string,
    expiryMinutes: number = 15 // Default 15 minutes expiry
  ): Promise<AttendanceSession> {
    try {
      const sessionId = `session_${Date.now()}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiryMinutes * 60000); // Add minutes

      const sessionData: AttendanceSession = {
        id: sessionId,
        courseId,
        courseName,
        createdBy: lecturerId,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: "active",
      };

      await setDoc(doc(db, "attendance_sessions", sessionId), sessionData);
      return sessionData;
    } catch (error) {
      console.error("Error creating attendance session:", error);
      throw new Error("Failed to create attendance session");
    }
  },

  // ===== 5. MARK ATTENDANCE FOR A STUDENT =====
  async markAttendance(
    sessionId: string,
    studentId: string,
    studentName: string,
    courseId: string
  ): Promise<StudentAttendance> {
    try {
      // Get the session to check expiry and status
      const sessionRef = doc(db, "attendance_sessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        throw new Error("Attendance session not found");
      }

      const session = sessionSnap.data() as AttendanceSession;

      // Check if session is still active
      if (session.status === "closed") {
        throw new Error("Attendance session is closed");
      }

      // Check if session has expired
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      if (now > expiresAt) {
        // Auto-close expired session
        await updateDoc(sessionRef, { status: "closed" });
        throw new Error("Attendance session has expired");
      }

      // Check if student already marked attendance
      const attendanceQuery: Query = query(
        collection(db, "student_attendance"),
        where("sessionId", "==", sessionId),
        where("studentId", "==", studentId)
      );

      const existingAttendance = await getDocs(attendanceQuery);

      if (!existingAttendance.empty) {
        throw new Error("You have already marked attendance for this session");
      }

      // Record attendance
      const attendanceId = `attendance_${sessionId}_${studentId}`;
      const attendanceData: StudentAttendance = {
        id: attendanceId,
        sessionId,
        courseId,
        studentId,
        studentName,
        markedAt: now.toISOString(),
      };

      await setDoc(
        doc(db, "student_attendance", attendanceId),
        attendanceData
      );

      return attendanceData;
    } catch (error) {
      console.error("Error marking attendance:", error);
      throw error;
    }
  },

  // ===== BONUS: GET ATTENDANCE RECORDS FOR A SESSION =====
  async getSessionAttendance(sessionId: string): Promise<StudentAttendance[]> {
    try {
      const q: Query = query(
        collection(db, "student_attendance"),
        where("sessionId", "==", sessionId)
      );

      const querySnapshot = await getDocs(q);
      const attendance: StudentAttendance[] = [];

      querySnapshot.forEach((doc) => {
        attendance.push(doc.data() as StudentAttendance);
      });

      return attendance;
    } catch (error) {
      console.error("Error fetching session attendance:", error);
      throw new Error("Failed to fetch attendance records");
    }
  },

  // ===== BONUS: CLOSE AN ATTENDANCE SESSION =====
  async closeAttendanceSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(db, "attendance_sessions", sessionId);
      await updateDoc(sessionRef, {
        status: "closed",
      });
    } catch (error) {
      console.error("Error closing attendance session:", error);
      throw new Error("Failed to close attendance session");
    }
  },

  // ===== BONUS: GET STUDENT'S ENROLLED COURSES =====
  async getStudentCourses(studentId: string): Promise<Course[]> {
    try {
      const q: Query = query(
        collection(db, "courses"),
        where("students", "array-contains", studentId)
      );

      const querySnapshot = await getDocs(q);
      const courses: Course[] = [];

      querySnapshot.forEach((doc) => {
        courses.push(doc.data() as Course);
      });

      return courses;
    } catch (error) {
      console.error("Error fetching student courses:", error);
      throw new Error("Failed to fetch courses");
    }
  },

  // ===== BONUS: GET SESSION BY ID =====
  async getSessionById(sessionId: string): Promise<AttendanceSession> {
    try {
      const sessionRef = doc(db, "attendance_sessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        throw new Error("Session not found");
      }

      return sessionSnap.data() as AttendanceSession;
    } catch (error) {
      console.error("Error fetching session:", error);
      throw error;
    }
  },

  // ===== BONUS: GET USER BY MATRIC NUMBER =====
  async getUserByMatricNumber(matricNumber: string): Promise<UserModel | null> {
    try {
      const q: Query = query(
        collection(db, "users"),
        where("matricNumber", "==", matricNumber)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs[0].data() as UserModel;
    } catch (error) {
      console.error("Error fetching user by matric number:", error);
      throw new Error("Failed to fetch user");
    }
  },

  // ===== BONUS: UPDATE COURSE =====
  async updateCourse(courseId: string, updates: Partial<Course>): Promise<void> {
    try {
      const courseRef = doc(db, "courses", courseId);
      await updateDoc(courseRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  // ===== BONUS: DELETE COURSE =====
  async deleteCourse(courseId: string): Promise<void> {
    try {
      // Delete the course document
      const courseRef = doc(db, "courses", courseId);
      
      // Delete all attendance sessions for this course
      const sessionsQuery: Query = query(
        collection(db, "attendance_sessions"),
        where("courseId", "==", courseId)
      );
      const sessionsSnap = await getDocs(sessionsQuery);
      
      const batch = writeBatch(db);
      
      // Add all sessions to batch delete
      sessionsSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Delete the course
      batch.delete(courseRef);
      
      await batch.commit();
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  },
};
