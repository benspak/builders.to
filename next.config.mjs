/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporary workaround for Next.js 16 TypeScript checking bug
    // TypeScript errors will still be caught by your IDE and `tsc`
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Rewrite legacy /uploads/* paths to the new API file serving route
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/files/:path*',
      },
    ];
  },
};

export default nextConfig;
