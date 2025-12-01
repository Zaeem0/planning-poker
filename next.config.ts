import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for optimized production builds
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Turbopack configuration for development
  turbopack: {
    root: __dirname,
  },

  // Compress responses
  compress: true,

  // Power off the X-Powered-By header
  poweredByHeader: false,

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || "",
  },
};

export default nextConfig;
