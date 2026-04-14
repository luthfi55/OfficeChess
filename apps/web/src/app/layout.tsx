import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkBoard — Project Management",
  description: "Collaborative project management and task tracking platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800 antialiased">{children}</body>
    </html>
  );
}
