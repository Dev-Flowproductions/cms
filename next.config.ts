import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // API routes hit middleware (session refresh); Next buffers the full body. Brand guidelines PDFs
  // and large cover reference images need headroom above per-file caps + multipart overhead.
  experimental: {
    middlewareClientMaxBodySize: "256mb",
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
