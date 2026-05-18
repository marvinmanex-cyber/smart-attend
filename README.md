# 🎓 Smart Attend - QR Code Attendance System

A modern, web-based attendance system using QR codes to prevent attendance fraud and save time for both lecturers and students.

## ✨ Features

### 🎯 Core Features
- **QR Code Generation** - Lecturers generate unique QR codes for each class session
- **Mobile QR Scanner** - Students scan QR codes to mark attendance using their phones
- **Anti-Cheating Time Limit** - Each session expires after 5 minutes
- **Duplicate Prevention** - Students can only mark attendance once per session
- **Real-Time Tracking** - Live attendance tracking during sessions
- **Attendance Reports** - Lecturers can download attendance records as CSV
- **Attendance History** - Students can view their attendance records

### 🔐 Security & Authentication
- Firebase authentication (Email/Password)
- Role-based access control (Student/Lecturer)
- Protected routes with automatic redirects
- Firestore database with security rules

### 🎨 User Experience
- Mobile-first responsive design
- Dark mode for lecturers (Navy & Gold theme)
- Light mode for students (Blue theme)
- Real-time countdown timer
- Loading states and error handling

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **QR Code**: qrcode.react (generation) & html5-qrcode (scanner)
- **UI Components**: Lucide React Icons
- **State Management**: React Context API

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase account with Firestore & Auth enabled

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/smart-attend.git
cd smart-attend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Run development server (low memory mode)**
```bash
npm run dev:low-mem
```

5. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📝 User Workflows

### Student Workflow
1. Register as a student (with matric number)
2. Login to dashboard
3. View enrolled courses
4. Open attendance scanner
5. Point camera at QR code
6. Attendance automatically marked
7. View attendance history

### Lecturer Workflow
1. Register as a lecturer (with staff ID)
2. Login to dashboard
3. Create a new course
4. View course details
5. Start attendance session (generates QR code)
6. Timer counts down from 5 minutes
7. Students scan the QR code
8. View attendance reports
9. Download as CSV

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
```bash
# Vercel
vercel

# Firebase Hosting
npm run build
firebase deploy
```

---

## ⚙️ Performance

- Low memory mode (512MB) - prevents system freezing
- Turbopack for fast builds
- Optimized images and CSS
- Efficient database queries

---

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📄 License

MIT License - feel free to use this project for commercial or personal purposes.

---

**Last Updated:** May 18, 2026 | **Version:** 1.0.0
