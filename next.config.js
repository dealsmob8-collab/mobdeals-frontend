/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'origin.mobdeals.co.ke',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/webhooks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
