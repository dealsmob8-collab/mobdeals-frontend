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
  async redirects() {
    return [
      // Root domain redirects handled at Cloudflare level
      // These are fallback redirects for local dev
      {
        source: '/',
        has: [
          {
            type: 'header',
            key: 'host',
            value: 'mobdeals.co.ke',
          },
        ],
        destination: 'https://shop.mobdeals.co.ke/',
        permanent: true,
      },
      {
        source: '/',
        has: [
          {
            type: 'header',
            key: 'host',
            value: 'www.mobdeals.co.ke',
          },
        ],
        destination: 'https://shop.mobdeals.co.ke/',
        permanent: true,
      },
    ];
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
