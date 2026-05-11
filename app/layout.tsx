import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import { DarkModeProvider } from "@/context/DarkModeContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GestionAlquiler",
  description: "Sistema de gestión de alquileres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex h-screen overflow-hidden">
        <SidebarProvider>
          <DarkModeProvider>
            <AuthProvider>
              <AuthGuard>
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 lg:pt-6 animate-fade-in">{children}</main>
              </AuthGuard>
            </AuthProvider>
          </DarkModeProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
