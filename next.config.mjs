/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Increase the timeout for chunk loading
    config.watchOptions = {
      ...config.watchOptions,
      aggregateTimeout: 600,
      poll: 1000,
    };
    
    // Enable source maps for better error debugging
    if (!isServer) {
      config.devtool = 'source-map';
    }
    
    return config;
  },
  // Your existing configuration here
};

export default nextConfig;
