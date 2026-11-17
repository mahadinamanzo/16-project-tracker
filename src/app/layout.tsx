import type { Metadata } from "next";
import type { ReactNode } from "react";
import UserMenu from "./user-menu";
import "./globals.css";

export const dynamic = "force-dynamic";

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
      <body className="min-h-screen text-slate-900 antialiased">
        <nav className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto flex max-w-7xl justify-end px-6 py-3">
            <UserMenu />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
