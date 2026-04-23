import type { ReactNode } from "react";

export const metadata = {
  title: "일감 | 한국형 시니어 스팟워크",
  description: "베이비부머 2차 세대를 위한 유연근무 플랫폼",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "Pretendard, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
