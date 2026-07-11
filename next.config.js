/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/financeiro-app',
        destination: 'https://financeiro-ten-kappa.vercel.app/',
      },
      {
        source: '/pessoal-app',
        destination: 'https://financeiro-ten-kappa.vercel.app/pessoal.html',
      },
    ]
  },
}

module.exports = nextConfig
