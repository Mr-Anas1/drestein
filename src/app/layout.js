import "./globals.css";
import { Audiowide, Space_Grotesk } from "next/font/google";
import SmoothFollower from "@/components/CursorEffect";
import AnimatedBackground from "@/components/AnimatedBackground";
import FloatingShapes from "@/components/FloatingShapes";
import CursorEffect from "@/components/CursorEffect";
import { AuthProvider } from "@/contexts/AuthContext";
import ProfileGuard from "@/components/ProfileGuard";

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
            <SmoothFollower />
            <AnimatedBackground />
            <FloatingShapes />
            <CursorEffect />
            {children}
          </ProfileGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
