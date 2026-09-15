import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "../styles/variables.css";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "MatchBook",
  description: "MatchBook",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.variable}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}