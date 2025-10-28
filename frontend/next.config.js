const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack config (empty for now since we're using webpack)
  turbopack: {},
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  async rewrites() {
    // Only use rewrites in development
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555'}/api/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    const webpack = require('webpack');

    // Ignore old SPA entry points and pages directory
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const resourcePath = resource;
          // Ignore old SPA entry points
          if (resourcePath.includes('/src/App.jsx') || resourcePath.includes('/src/main.jsx')) {
            return true;
          }
          // Ignore all files in src/pages directory
          if (resourcePath.includes('/src/pages/')) {
            return true;
          }
          return false;
        },
      })
    );

    // Also set up module rules to prevent compilation of old files
    if (!isServer) {
      // For client-side build, exclude old files
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/src/pages/CreateListing': false,
        '@/src/pages/Dashboard': false,
        '@/src/pages/Home': false,
        '@/src/pages/ListingDetail': false,
        '@/src/pages/Login': false,
        '@/src/pages/Register': false,
        '@/src/pages/Profile': false,
        '@/src/pages/PublicProfile': false,
        '@/src/App': false,
        '@/src/main': false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
