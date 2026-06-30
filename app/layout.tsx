import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Madlen · AI Teaching Suite",
  description:
    "Three ready-to-use AI classroom tools: a lesson prep assistant, a student chatbot, and an essay grader.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
