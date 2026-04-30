import type { ReactNode } from "react";
import { DM_Serif_Display, DM_Mono } from "next/font/google";

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata = {
  title: "일감 어드민 | 시니어 스팟워크 플랫폼",
  description: "일감 구인자 어드민 — 공고 등록·지원자 관리·정산",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${dmSerif.variable} ${dmMono.variable}`}>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#f7f5f0",
          color: "#0d1b2a",
          fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "14px",
          lineHeight: "1.65",
        }}
      >
        {children}
      </body>
    </html>
  );
}
