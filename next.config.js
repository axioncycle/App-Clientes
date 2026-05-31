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
    ]
  },
}

module.exports = nextConfig
