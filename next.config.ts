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
};

export default nextConfig;
