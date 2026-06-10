import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cho phép ảnh từ Cloudinary (production)
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        // Cho phép ảnh từ backend local (dev)
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
