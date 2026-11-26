import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Дубль кейсу на старому сайті (той самий текст під іншою адресою) — ведемо на основну сторінку
  async redirects() {
    return [{ source: "/stati/hozyain-barin-startovaya-rk", destination: "/stati/hb-startovyy-pr", permanent: true }];
  },
  // Заголовки безпеки: лише https, без вбудовування сайту в чужі фрейми (клікджекінг),
  // без вгадування типів файлів; адмінка — поза пошуком і без кешування.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  images: {
    // Фото з адмінки на проді лежать у Vercel Blob — next/image має право їх оптимізувати
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
