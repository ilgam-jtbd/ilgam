import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ILGAM — Senior Expert Spot Work",
  description: "검증된 시니어 전문가를 필요한 순간에. 기업과 전문가를 연결하는 스팟 워크 플랫폼.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
