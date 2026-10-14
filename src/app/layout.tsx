import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medda Notes – Take-home",
  description: "Generate clinical notes from visit transcripts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
