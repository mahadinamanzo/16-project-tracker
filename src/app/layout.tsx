import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Project Tracker",
    template: "%s | Project Tracker",
  },
  description: "Track projects, tasks, and progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 antialiased">{children}</body>
    </html>
  );
}
