import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ilgam.kr";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/auth/", "/dashboard/", "/internal/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
