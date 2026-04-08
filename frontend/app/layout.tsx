import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});


export const metadata: Metadata = {
  title: "Taskly",
  description: "Task tracker with Next.js, Express, MongoDB, and Redis"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  );
}