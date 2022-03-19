const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

// https://nextjs.org/docs/advanced-features/security-headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `default-src 'self'`,
  },
  {
    key: 'Permissions-Policy',
    value: 'microphone=(), geolocation=()',
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
const baseConfig = {
  reactStrictMode: true,
  env: {
    // REDIS_URL: 'redis://localhost:6379',
  }
};

module.exports = (phase, { _defaultConfig }) => {
  return (phase === PHASE_DEVELOPMENT_SERVER) ? baseConfig
  : { 
      ...baseConfig,
      headers: async () => [{ source: '/:path*',  headers: securityHeaders }],
    }
};
