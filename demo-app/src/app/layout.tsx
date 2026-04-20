import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Calendar Select — Demo",
  description:
    "Interactive demo for next-calendar-select: pick a date with an accessible modal calendar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sr-only">
          <h1>Next Calendar Select Demo</h1>
          <p>
            Interactive demo for next-calendar-select: pick a date with an
            accessible modal calendar.
          </p>
        </header>
        {children}
      </body>
    </html>
  );
}
