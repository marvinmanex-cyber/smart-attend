import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRouteWrapper } from "@/components/ProtectedRouteWrapper";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProtectedRouteWrapper>
            {children}
            <MobileBottomNav />
          </ProtectedRouteWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
// layout.tsx
// app/layout.tsx
export const metadata = {
  title: "SmartAttend",
  description: "Smart Attendance System",
  manifest: "/manifest.json",
  themeColor: "#4338ca",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SmartAttend",
  },
  formatDetection: {
    telephone: false,
  },
};

// Also, add this viewport export right below metadata
export const viewport = {
  themeColor: "#4338ca",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};