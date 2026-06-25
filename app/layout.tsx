import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WE ARE DREAMERS 산모임",
  description: "교회 청년부 산모임 출석 및 조 편성",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
