import type { NextConfig } from 'next';
import { execSync } from 'child_process';

function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  turbopack: {
    root: __dirname,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  env: {
    NEXT_PUBLIC_COMMIT_HASH: getGitCommitHash(),
  },
};

export default nextConfig;
