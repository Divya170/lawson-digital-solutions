import type { NextConfig } from 'next';

/** Where the NestJS API runs. The browser only ever talks to Next.js; requests are proxied. */
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` },
      { source: '/uploads/:path*', destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },
  async headers() {
    // Keep the staff portal out of search engines.
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [
      { source: '/staff', headers: noindex },
      { source: '/staff/:path*', headers: noindex },
    ];
  },
};

export default nextConfig;
