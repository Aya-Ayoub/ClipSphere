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
    <html lang="en" className="bg-black">
      <body className="bg-black text-white min-h-screen flex flex-col">

        <AuthProvider>
          <Navbar />

          {/* App content */}
          <main className="flex-1 pt-16 bg-black">
            {children}
          </main>

        </AuthProvider>

      </body>
    </html>
  );
}