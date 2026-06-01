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
        // Proxy Vowt API calls from Financeiro SPA
        source: '/api/vowt',
        destination: 'https://financeiro-ten-kappa.vercel.app/api/vowt',
      },
    ]
  },
}

module.exports = nextConfig
