# Smart Attend - Deployment Guide

## 🚀 Overview

Smart Attend is a QR code-based attendance system that solves attendance fraud and saves time for lecturers and students.

**Key Features:**
- ✅ QR code generation for each class session
- ✅ Student QR code scanning for attendance
- ✅ Anti-cheating time limit (5-minute sessions)
- ✅ Real-time attendance tracking
- ✅ Attendance reports for lecturers
- ✅ Attendance history for students
- ✅ Role-based access (students & lecturers)
- ✅ Firebase authentication & Firestore database

---

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Firebase Project** with:
   - Authentication enabled (Email/Password)
   - Firestore database
   - Environment variables configured

---

## 🛠️ Local Development Setup

### 1. Clone and Install Dependencies
```bash
cd smart-attend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server (Low Memory Mode)
```bash
npm run dev:low-mem
```

The app will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
smart-attend/
├── src/
│   ├── app/
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── student/            # Student dashboard
│   │   ├── student/attendance-history/
│   │   ├── lecturer/           # Lecturer dashboard
│   │   ├── lecturer/courses/   # Course management
│   │   ├── attendance/         # Student QR scanner
│   │   ├── session/create/     # QR code generation
│   │   └── layout.tsx          # Root layout with auth protection
│   ├── components/
│   │   └── ProtectedRouteWrapper.tsx  # Route protection
│   ├── context/
│   │   └── AuthContext.tsx     # Auth context provider
│   ├── lib/
│   │   └── firebase.ts         # Firebase config
│   ├── services/
│   │   ├── auth_service.ts     # Auth functions
│   │   └── firestore_service.ts # Firestore operations
│   └── types/
│       └── index.ts            # TypeScript types
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## 🔐 Database Schema (Firestore)

### Collections:

#### 1. `users`
```json
{
  "uid": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student|staff",
  "createdAt": "2026-05-18T10:00:00Z",
  "matricNumber": "MTH/2024/001",      // Students
  "staffId": "STAFF/2024/001"          // Lecturers
}
```

#### 2. `courses`
```json
{
  "id": "CS101_1234567890",
  "code": "CS101",
  "title": "Intro to Computer Science",
  "description": "...",
  "lecturerId": "lecturer_uid",
  "lecturerName": "Dr. Smith",
  "students": ["student_uid_1", "student_uid_2"],
  "createdAt": "2026-05-18T10:00:00Z",
  "updatedAt": "2026-05-18T10:00:00Z"
}
```

#### 3. `attendance_sessions`
```json
{
  "id": "session_1234567890",
  "courseId": "CS101_1234567890",
  "courseName": "Intro to Computer Science",
  "createdBy": "lecturer_uid",
  "createdAt": "2026-05-18T10:00:00Z",
  "expiresAt": "2026-05-18T10:05:00Z",
  "status": "active|closed"
}
```

#### 4. `student_attendance`
```json
{
  "id": "attendance_session_1234567890_student_uid",
  "sessionId": "session_1234567890",
  "courseId": "CS101_1234567890",
  "studentId": "student_uid",
  "studentName": "Jane Doe",
  "markedAt": "2026-05-18T10:02:00Z"
}
```

---

## 🚀 Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your_repo_url
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Click "Deploy"

### Option 2: Deploy to Firebase Hosting

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
```

2. **Build the app**
```bash
npm run build
```

3. **Initialize Firebase**
```bash
firebase init hosting
# Select your Firebase project
# Set public directory to: .next
# Configure rewrites for Next.js
```

4. **Deploy**
```bash
firebase deploy
```

### Option 3: Deploy to Any Node.js Host (Heroku, Railway, etc.)

1. **Build the app**
```bash
npm run build
```

2. **Start production server**
```bash
npm start
```

3. **Set environment variables** on your hosting platform

---

## 📱 Usage

### Student Flow:
1. Register as a Student
2. Login to student dashboard
3. View enrolled courses
4. Tap "Scan QR Code" to mark attendance
5. Point camera at QR code displayed by lecturer
6. View attendance history

### Lecturer Flow:
1. Register as a Lecturer
2. Login to lecturer dashboard
3. Create a course
4. Add course code, title, and description
5. Click "Create Attendance Session"
6. QR code generates (5-minute timer)
7. Share QR code with students
8. View attendance reports
9. Download as CSV

---

## ⚠️ Anti-Cheating Features

✅ **Time-Limited Sessions** - 5-minute expiry for each session
✅ **Duplicate Prevention** - Student can't mark attendance twice
✅ **Geolocation Ready** - Can be extended to require location
✅ **One-to-Many Prevention** - QR code expires after time limit

---

## 🔧 Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |

---

## 📊 Performance Optimization

- ✅ Low memory mode (512MB heap) - prevents laptop freezing
- ✅ Turbopack for fast builds
- ✅ Image optimization with Next.js Image component
- ✅ CSS optimization with Tailwind
- ✅ Code splitting and lazy loading

---

## 🐛 Troubleshooting

### "Port 3000 is in use"
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9  # macOS/Linux
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process  # Windows
```

### Firebase connection issues
- Verify `.env.local` is correct
- Check Firebase project permissions
- Ensure Firestore is in production mode (not in test mode)

### QR code scanner not working
- Enable camera permissions in browser
- Use HTTPS in production (required for camera access)
- Test on a mobile device for best results

---

## 📈 Future Enhancements

- [ ] Geolocation verification
- [ ] Facial recognition integration
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Biometric attendance
- [ ] Email notifications
- [ ] SMS notifications

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👥 Support

For issues and questions, please create an issue on GitHub or contact the development team.

---

**Last Updated:** May 18, 2026
**Version:** 1.0.0
