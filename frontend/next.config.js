const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  // Оптимизация для продакшена
  swcMinify: true,
  // Настройки для статических файлов
  trailingSlash: false,
  // Отключаем оптимизацию изображений для лучшей совместимости
  images: {
    unoptimized: true,
  },
  // Настройки для production
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
