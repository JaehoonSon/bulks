/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/img/:path*",
        destination: "http://109.199.116.115:7999/:path*",
      },
    ];
  },
};

export default nextConfig;
