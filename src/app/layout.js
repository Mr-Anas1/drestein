import "./globals.css";
import { Audiowide, Space_Grotesk } from "next/font/google";
import SmoothFollower from "@/components/CursorEffect";
import AnimatedBackground from "@/components/AnimatedBackground";
import FloatingShapes from "@/components/FloatingShapes";
import CursorEffect from "@/components/CursorEffect";
import { AuthProvider } from "@/contexts/AuthContext";
import ProfileGuard from "@/components/ProfileGuard";
import PageLoader from "@/components/PageLoader";
import { Suspense } from "react";
import { Analytics } from '@vercel/analytics/next';

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: "DRESTEIN",
  description: "DRESTEIN",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
    >
      <body>
        <AuthProvider>
          <ProfileGuard>
            <Suspense fallback={null}>
              <PageLoader />
            </Suspense>
            <SmoothFollower />
            <AnimatedBackground />
            <FloatingShapes />
            <CursorEffect />
            <Analytics />
            {children}
          </ProfileGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
