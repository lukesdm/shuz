
// https://nextjs.org/docs/advanced-features/security-headers
const securityHeaders = [
  // CSP is set in _document.tsx, alongside nonce generation
  // {
  //   key: 'Content-Security-Policy',
  //   value: `default-src 'self'`,
  // },
  {
    key: 'Permissions-Policy',
    value: 'microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'same-origin',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() { return [{ source: '/:path*',  headers: securityHeaders }] },
  reactStrictMode: true,
  env: {
    // REDIS_URL: 'redis://localhost:6379',
  }
};

module.exports = nextConfig;
