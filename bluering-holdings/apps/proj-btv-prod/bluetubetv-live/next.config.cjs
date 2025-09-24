/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_HLS_MAIN: process.env.NEXT_PUBLIC_HLS_MAIN,
    NEXT_PUBLIC_HLS_A: process.env.NEXT_PUBLIC_HLS_A,
    NEXT_PUBLIC_HLS_B: process.env.NEXT_PUBLIC_HLS_B,
    NEXT_PUBLIC_TIPJAR_ADDRESS: process.env.NEXT_PUBLIC_TIPJAR_ADDRESS,
    NEXT_PUBLIC_PAYOUT_ADDRESS: process.env.NEXT_PUBLIC_PAYOUT_ADDRESS,
    NEXT_PUBLIC_MOMENT_ADDRESS: process.env.NEXT_PUBLIC_MOMENT_ADDRESS,
  },
  webpack: (config) => {
    config.resolve.fallback = { ...(config.resolve.fallback||{}), fs:false, net:false, tls:false };
    return config;
  },
  async headers() {
    return [{ source: "/overlays/:path*", headers: [
      { key: "Cache-Control", value: "public, max-age=0, must-revalidate" }
    ]}];
  }
};
module.exports = nextConfig;
