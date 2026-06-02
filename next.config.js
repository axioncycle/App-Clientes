/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        // Proxy Financeiro SPA transparently — same origin so iframe works
        source: '/financeiro-app',
        destination: 'https://financeiro-ten-kappa.vercel.app/',
      },
      {
        // Proxy Vowt API calls from Financeiro SPA through Financeiro server
        source: '/api/vowt',
        destination: 'https://financeiro-ten-kappa.vercel.app/api/vowt',
      },
      {
        // Proxy ML API calls from Financeiro SPA through Financeiro server
        source: '/api/ml-proxy',
        destination: 'https://financeiro-ten-kappa.vercel.app/api/ml-proxy',
      },
    ]
  },
}

module.exports = nextConfig
