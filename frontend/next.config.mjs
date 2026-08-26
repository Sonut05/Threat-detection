/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress responses
  compress: true,

  // Optimize package imports — only import what's used from large libraries
  experimental: {
    optimizePackageImports: ["three", "recharts"],
  },

  // Cache headers for static assets
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
