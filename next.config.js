/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optional isolated build directory for local checks in synced folders.
  distDir: process.env.MIC_BUILD_DIR || '.next',
}

module.exports = nextConfig
