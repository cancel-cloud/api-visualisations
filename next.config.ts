import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingIncludes: {
    "/api/coffee/route": ["./data/text-8A02DB514049-1.csv"],
  },
  reactCompiler: true,
};

export default nextConfig;
