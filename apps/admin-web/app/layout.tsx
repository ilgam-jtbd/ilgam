import type { ReactNode } from "react";

export const metadata = {
  title: "일감 어드민 | 시니어 스팟워크 플랫폼",
  description: "일감 구인자 어드민 — 공고 등록·지원자 관리·정산",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style>{`
          @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #f7f5f0;
            color: #0d1b2a;
            font-family: 'Pretendard', -apple-system, sans-serif;
            font-size: 14px;
            line-height: 1.65;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
