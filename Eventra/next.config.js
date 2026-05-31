/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  allowedDevOrigins: ['rancidity-blighted-acquire.ngrok-free.dev'],
}

module.exports = nextConfig
