/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    REDIS_URL: 'redis://localhost:6379',
  }
}

module.exports = nextConfig
