import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
  },
  async redirects() {
    return [
      // Ezoic ads.txt management — redirect to the Ezoic-managed file (account 19390).
      // Ezoic keeps the authorized-seller list current, including Google entries.
      {
        source: "/ads.txt",
        destination: "https://srv.adstxtmanager.com/19390/toolpile.app",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
