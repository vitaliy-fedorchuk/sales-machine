import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Дубль кейсу на старому сайті (той самий текст під іншою адресою) — ведемо на основну сторінку
  async redirects() {
    return [{ source: "/stati/hozyain-barin-startovaya-rk", destination: "/stati/hb-startovyy-pr", permanent: true }];
  },
  images: {
    // Фото з адмінки на проді лежать у Vercel Blob — next/image має право їх оптимізувати
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
