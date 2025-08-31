import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { YearProvider } from '@/contexts/YearContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IPL Dashboard - Points Table & Schedule",
  description: "Live IPL points table and match schedule with real-time data",
  icons: {
    icon: '/ipl-favicon.svg',
    apple: '/ipl-favicon.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/ipl-favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <YearProvider>
          {children}
        </YearProvider>
      </body>
    </html>
  );
}
