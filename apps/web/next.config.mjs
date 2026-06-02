/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async rewrites() {
    return [{ source: "/backend/:path*", destination: "http://localhost:4000/:path*" }];
  },
};

export default nextConfig;
