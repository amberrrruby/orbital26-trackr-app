import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  outputFileTracingIncludes: {
    "/resumes/new": ["./node_modules/@napi-rs/canvas/**/*.node"],
    "/resumes/[id]/edit": ["./node_modules/@napi-rs/canvas/**/*.node"],
  },
  serverExternalPackages: ["@napi-rs/canvas"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dqafqjaktmhnfqobxddr.supabase.co",
      },
    ],
  },
};

export default nextConfig;
