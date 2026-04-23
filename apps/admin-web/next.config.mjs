/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
  // 한국어 기본
  i18n: undefined, // App Router에서는 /app/[locale] 패턴 사용 예정
  transpilePackages: ["@ilgam/core", "@ilgam/design-tokens"],
};
export default nextConfig;
