/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Proxy API to backend in dev so frontend can use same-origin requests
  async rewrites() {
    return [
      { source: '/api-proxy/:path*', destination: 'http://localhost:8000/api/:path*' },
    ]
  },
}

export default nextConfig
