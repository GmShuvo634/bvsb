/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['eu.ui-avatars.com', 'localhost'],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data: https://eu.ui-avatars.com http://localhost:5001; " +
              "connect-src 'self' http://localhost:5001 ws://localhost:5001 wss://www.walletlink.org https://mainnet.infura.io https://eth.merkle.io https://api.coingecko.com https://bscrpc.com https://bsc-dataseed2.ninicoin.io; " +
              "media-src 'self' http://localhost:3000;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
