import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// A distinctive, humanist-geometric sans with full Turkish (latin-ext) support,
// loaded via next/font (self-hosted at build, no render-blocking <link>).
// Deliberately not Inter, per the design-taste guidance.
const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html lang="tr" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
