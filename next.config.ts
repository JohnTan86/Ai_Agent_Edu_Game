import type { NextConfig } from "next";

const isCpanelExport = process.env.CPANEL_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isCpanelExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
