
import 'dotenv/config';

if (process.env.NODE_ENV === 'production') {
  await import('dotenv').then((dotenv) => dotenv.config({ path: '.env.production' }));
} else {
  await import('dotenv').then((dotenv) => dotenv.config({ path: '.env.local' }));
}

import './app/lib/buildTimeConfig.mjs';  // Changé en .mjs pour la cohérence ESM

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ajoutez ici votre configuration Next.js
  reactStrictMode: true, // Active le mode strict de React
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'teamr-assets.s3.eu-west-3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;