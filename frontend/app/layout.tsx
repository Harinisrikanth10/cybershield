import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "CyberShield AI — Intelligent Threat Detection & Digital Safety Platform",
  description: "Detect suspicious messages, investigate phishing URLs, inspect deepfakes, and stay protected with transparent AI risk analysis.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/cybershield-shield.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cyber-dark text-cyber-text antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
