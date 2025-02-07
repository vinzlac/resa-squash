/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Copie le fichier JSON pendant le build
      config.module.rules.push({
        test: /allLicencies\.json$/,
        type: 'asset/resource'
      });
    }
    return config;
  }
};

module.exports = nextConfig; 