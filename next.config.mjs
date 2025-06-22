/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
  distDir: 'dist',
  // Remove assetPrefix for fonts to work properly
  // assetPrefix: './',
  basePath: '',
  experimental: {
    esmExternals: 'loose'
  }
}

export default nextConfig
