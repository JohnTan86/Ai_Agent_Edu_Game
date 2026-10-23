import type { NextConfig } from "next";

const isCpanelExport = process.env.CPANEL_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isCpanelExport
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
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
