import type { NextConfig } from "next";
import withLlamaIndex from "llamaindex/next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "32mb",
    },
  },
  serverExternalPackages: ["sharp", "canvas", "onnxruntime-node"],
};

export default withLlamaIndex(nextConfig);
