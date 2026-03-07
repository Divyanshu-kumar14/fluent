/**
 * Root Layout
 *
 * The top-level layout wrapping every page in the application.
 * Sets up:
 *   - ClerkProvider for authentication context.
 *   - TRPCReactProvider for type-safe API access.
 *   - Global fonts (Inter + Geist Mono).
 *   - Global CSS and the Sonner toast container.
 */

import type { Metadata } from "next";

import { Inter, Geist_Mono } from "next/font/google";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/layout/theme-provider";

import { TRPCReactProvider } from "@/trpc/client";

/** Primary UI font — Inter (variable weight). */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/** Monospace font — Geist Mono (used for code/tabular content). */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Default metadata for the application. */
export const metadata: Metadata = {
  title: {
    default: "Fluent",
    template: "%s | Fluent",
  },
  description: "AI-powered Text-to-Speech and Voice Cloning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TRPCReactProvider>
              {children}
              <Toaster />
            </TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
