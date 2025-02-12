import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {},
    reactCompiler: true,
  },
};

export default nextConfig;
