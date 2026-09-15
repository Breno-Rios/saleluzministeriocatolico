import type { NextConfig } from "next";

const allowedDevOrigins = process.env.NEXT_DEV_ALLOWED_ORIGINS
  ? process.env.NEXT_DEV_ALLOWED_ORIGINS.split(",").map((origin) =>
      origin.trim(),
    )
  : ["10.164.169.213", "192.168.15.19"];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  images: {
    // Capas das músicas: por padrão a thumb do próprio vídeo no YouTube, e o
    // Blob para quando alguém subir uma arte própria pelo painel.
    remotePatterns: [
      new URL("https://i.ytimg.com/vi/**"),
      new URL("https://*.public.blob.vercel-storage.com/**"),
    ],
  },
};

export default nextConfig;
