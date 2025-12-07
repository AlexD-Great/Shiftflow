/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  serverExternalPackages: ['pino', 'pino-pretty'],
}

module.exports = nextConfig
