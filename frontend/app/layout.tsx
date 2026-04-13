import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ClipSphere",
  description: "Short video social platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}