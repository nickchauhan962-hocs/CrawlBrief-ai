import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure server-only packages are properly handled
  serverExternalPackages: ["undici", "ipaddr.js", "robots-parser"],
};

export default nextConfig;
