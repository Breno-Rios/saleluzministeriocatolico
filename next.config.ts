import type { NextConfig } from "next";

const allowedDevOrigins = process.env.NEXT_DEV_ALLOWED_ORIGINS
  ? process.env.NEXT_DEV_ALLOWED_ORIGINS.split(",").map((origin) =>
      origin.trim(),
    )
  : ["10.164.169.213", "192.168.15.19"];

const nextConfig: NextConfig = {
  allowedDevOrigins,
};

export default nextConfig;
