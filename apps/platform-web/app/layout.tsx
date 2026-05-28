import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "VELOR — 검증된 시니어 전문가 네트워크",
  description: "임원 출신 전문가의 경험을 지금 바로 빌려드립니다. 2,400명의 검증된 시니어 전문가와 850개 기업을 연결하는 스팟워크 플랫폼.",
  openGraph: {
    title: "VELOR — 검증된 시니어 전문가 네트워크",
    description: "임원 출신 전문가와 1시간 만에 연결. 프로젝트 자문 · 원포인트 자문 · 인재추천.",
    type: "website",
  },
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
        {/* VWO Async SmartCode — replace ACCOUNT_ID with actual VWO account */}
        {process.env.NEXT_PUBLIC_VWO_ACCOUNT_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
window._vwo_code||(function(){
var a=window.d=document,b=a.createElement("script");
b.src="https://dev.visualwebsiteoptimizer.com/j.php?a=${process.env.NEXT_PUBLIC_VWO_ACCOUNT_ID}&t=1&i=true&j=true&p=default";
a.head.appendChild(b);
})();
`,
            }}
          />
        )}
      </head>
      <body className="font-sans bg-[#060d18]">
        {children}
        {/* PostHog / analytics placeholder */}
        {process.env.NEXT_PUBLIC_POSTHOG_KEY && (
          <Script
            id="posthog"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_KEY}',{api_host:'https://app.posthog.com'})
`,
            }}
          />
        )}
      </body>
    </html>
  );
}
