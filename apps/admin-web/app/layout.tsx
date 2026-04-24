import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ilgam.kr";

// SEO 키워드 근거:
// · 단기알바·당일알바·동네알바·시니어알바 → 네이버/구글 검색 고빈도 (알바몬·알바천국·당근알바·급구 카테고리)
// · 4060·중장년·50대·60대 → 공공 (워크넷·서울시 50플러스) 및 민간 플랫폼 공용 태그
// · 당일정산·즉시정산 → ILGAM USP (스팟워크 결제 모델)
// · 내주변·근처 → dong_code 기반 proximity 매칭 USP
const TITLE = "일감 | 시니어 단기알바·당일정산·내 주변 동네알바";
const DESCRIPTION =
  "50대·60대 시니어와 중장년을 위한 단기알바 플랫폼. 내 주변 동네알바를 찾고, 일한 날 바로 당일 정산 받으세요. 검증된 4060 워커와 기업을 매칭합니다.";
const KEYWORDS = [
  // 핵심
  "시니어알바",
  "중장년알바",
  "단기알바",
  "당일알바",
  "동네알바",
  "내주변알바",
  // 연령 타겟
  "4060알바",
  "50대알바",
  "60대알바",
  "70대알바",
  // 공공/정책 연계
  "고령자일자리",
  "노인일자리",
  "중장년일자리",
  // USP
  "당일정산",
  "즉시정산",
  "유연근무",
  "시간제",
  "스팟워크",
  "용돈벌이",
  // 지역
  "서울알바",
  "강서구알바",
  "송파구알바",
  "마포구알바",
  // 브랜드
  "일감",
  "ILGAM",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: TITLE,
    template: "%s | 일감",
  },
  description: DESCRIPTION,
  applicationName: "일감",
  keywords: KEYWORDS,
  authors: [{ name: "ILGAM", url: siteUrl }],
  creator: "ILGAM",
  publisher: "ILGAM",
  category: "Employment",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180" }],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: siteUrl,
    siteName: "일감",
    images: [
      { url: "/og-image.png", width: 1254, height: 1254, alt: "일감 — 시니어 단기알바 플랫폼" },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
    languages: { "ko-KR": siteUrl },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    // 네이버 / 다음 웹마스터도구 등록 후 실 토큰으로 교체
    "naver-site-verification": process.env.NAVER_SITE_VERIFICATION ?? "",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#EE8019",
};

// JSON-LD 구조화 데이터 (검색엔진 리치 카드 지원)
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "일감 (ILGAM)",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  sameAs: [],
  description: DESCRIPTION,
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "일감",
  url: siteUrl,
  inLanguage: "ko-KR",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body style={{ margin: 0, fontFamily: "Pretendard, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
