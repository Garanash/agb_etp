const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  // Совместимость с браузерами
  experimental: {
    esmExternals: 'loose'
  },
  // Оптимизация для продакшена
  swcMinify: true,
  // Поддержка старых браузеров
  transpilePackages: [],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
