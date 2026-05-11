/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Cap at 1920 to prevent 3840w images
  }
};
module.exports = nextConfig;
