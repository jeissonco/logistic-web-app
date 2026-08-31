import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hide the dev-mode badge so it doesn't sit on top of the bottom nav.
  devIndicators: false,
  // Consume @logistic/core straight from TypeScript source — no separate build step.
  transpilePackages: ['@logistic/core'],
  // googleapis / google-auth-library / bcryptjs are server-only; never bundle them.
  serverExternalPackages: ['googleapis', 'google-auth-library', 'bcryptjs'],
};

export default nextConfig;
