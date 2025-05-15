/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 15 configuration
  // The appDir option is no longer necessary in Next.js 15 as App Router is the default
  
  // If we need Tailwind integration (likely, given dependencies)
  // postcss: {
  //   plugins: {
  //     tailwindcss: {},
  //     autoprefixer: {},
  //   },
  // },

  async headers() {
    return [
      {
        // Apply these headers to all routes in your application
        source: '/:path*',
        headers: [
          // Security Headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
             key: 'X-Frame-Options',
             value: 'SAMEORIGIN'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()' // Adjust based on features needed
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.supabase.net; frame-ancestors 'none';"
          },
          // CORS Headers (Example - Adjust Origins as needed)
          // Note: Applying CORS headers here might conflict if individual API routes set them.
          // Consider setting them only on API routes (/api/:path*) if needed.
          // {
          //   key: 'Access-Control-Allow-Origin',
          //   value: 'http://localhost:5173, http://localhost:3000, https://YOUR_FRONTEND_DOMAIN' // Example origins
          // },
          // {
          //   key: 'Access-Control-Allow-Methods',
          //   value: 'GET, POST, PUT, DELETE, OPTIONS'
          // },
          // {
          //   key: 'Access-Control-Allow-Headers',
          //   value: 'Content-Type, Authorization'
          // },
          // {
          //   key: 'Access-Control-Allow-Credentials',
          //   value: 'true'
          // },
        ],
      },
      {
        // More specific CORS headers just for API routes
        source: '/api/:path*',
        headers: [
           {
             key: 'Access-Control-Allow-Credentials',
             value: 'true'
           },
           {
             key: 'Access-Control-Allow-Origin',
             // Value can be dynamic based on request origin or list specific origins
             // Using '*' is generally discouraged for credentialed requests
             value: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' // Default to Vite dev port, use env var for others
           },
           {
             key: 'Access-Control-Allow-Methods',
             value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS'
           },
           {
             key: 'Access-Control-Allow-Headers',
             value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' // Common headers
           },
        ]
      }
    ];
  },
};

export default nextConfig; 