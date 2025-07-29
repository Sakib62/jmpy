import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "JMPY - Simple URL Shortener",
  description:
    "Shorten your links quickly and easily with JMPY. Custom aliases, analytics, and more!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
        {children}
      </body>
    </html>
  );
}
