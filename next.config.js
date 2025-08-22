/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Turbopack is already enabled via CLI flag
  },
  // Disable middleware completely
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://rosai-rho.vercel.app',
  },
}

module.exports = nextConfig