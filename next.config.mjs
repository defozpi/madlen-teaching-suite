/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint is run separately via `npm run lint`; do not let a style rule fail the
  // production build / Vercel deploy.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
