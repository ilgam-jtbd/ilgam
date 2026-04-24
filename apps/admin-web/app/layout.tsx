import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://ilgam.kr"),
  title: {
    default: "일감 | 한국형 시니어 스팟워크",
    template: "%s | 일감",
  },
  description:
    "베이비부머 2차 세대를 위한 유연근무 플랫폼. 954만 시니어가 유연하게 일하고, 기업은 검증된 워커 풀을 즉시 활용합니다.",
  applicationName: "일감",
  keywords: ["시니어", "스팟워크", "일감", "유연근무", "베이비부머", "채용"],
  authors: [{ name: "ILGAM" }],
  icons: {
    icon: [
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "일감 | 한국형 시니어 스팟워크",
    description: "954만 시니어가 유연하게 일하는 플랫폼",
    url: "https://ilgam.kr",
    siteName: "일감",
    images: [{ url: "/og-image.png", width: 1254, height: 1254, alt: "일감 로고" }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "일감 | 한국형 시니어 스팟워크",
    description: "954만 시니어가 유연하게 일하는 플랫폼",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#EE8019",
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
