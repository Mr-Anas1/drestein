import "./globals.css";
import { Audiowide, Space_Grotesk } from "next/font/google";
import SmoothFollower from "@/components/CursorEffect";
import AnimatedBackground from "@/components/AnimatedBackground";
import FloatingShapes from "@/components/FloatingShapes";
import CursorEffect from "@/components/CursorEffect";
import { AuthProvider } from "@/contexts/AuthContext";
import ProfileGuard from "@/components/ProfileGuard";
import PageLoader from "@/components/PageLoader";
import LoadingScreen from "@/components/LoadingScreen";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";

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
    <html lang="en" className={`${audiowide.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AuthProvider>
          <ProfileGuard>
            <Suspense fallback={null}>
              <PageLoader />
              <LoadingScreen />
            </Suspense>
            <SmoothFollower />
            <AnimatedBackground />
            {/* <FloatingShapes /> */}
            {/* <CursorEffect /> */}
            {children}
            <Analytics /> 
          </ProfileGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
