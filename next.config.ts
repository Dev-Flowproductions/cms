import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // API routes hit middleware (session refresh); Next buffers the full body. Large guideline PDFs
  // (e.g. 20MB+) need headroom above the app file cap + multipart overhead.
  experimental: {
    middlewareClientMaxBodySize: "64mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
