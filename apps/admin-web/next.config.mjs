/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000", "*.vercel.app", "ilgam.kr", "*.ilgam.kr"] },
    optimizePackageImports: ["@ilgam/core", "@ilgam/design-tokens"],
  },

  transpilePackages: ["@ilgam/core", "@ilgam/design-tokens"],

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
    dangerouslyAllowSVG: false,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
    ],
  },

  // 보안 헤더 + 캐시 튜닝
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const baseSecurityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      // dev 에서는 Claude Preview iframe 접근을 위해 X-Frame-Options 생략.
      ...(isDev ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];
    return [
      {
        source: "/:path*",
        headers: baseSecurityHeaders,
      },
      {
        source: "/(logo|og-image|icon-512).(png|jpg)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // /auth/* 는 절대 캐시 금지
        source: "/auth/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
