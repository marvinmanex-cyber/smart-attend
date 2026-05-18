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