import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'ssl.cdn-redfin.com',
      'redfin.com',
      'media.redfin.com',
      'ssl-images.redfin.com',
      'img.redfin.com'
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https://*.redfin.com https://*.cdn-redfin.com https://ssl-images.redfin.com;
              font-src 'self';
              connect-src 'self' https://*.vercel.app https://*.redfin.com;
              frame-src 'self';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              block-all-mixed-content;
              upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim()
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
