/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: '**.supabase.in',
            },
            {
                protocol: 'https',
                hostname: 'cdn.shopify.com',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 86400,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', '@supabase/supabase-js', 'sonner'],
        // Enables CSS chunking per route - reduces unused CSS per page
        cssChunking: 'strict',
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },
    // Optimize chunk splitting to reduce unused JS per page
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.optimization.splitChunks = {
                ...config.optimization.splitChunks,
                cacheGroups: {
                    ...config.optimization.splitChunks?.cacheGroups,
                    supabase: {
                        test: /[\\/]node_modules[\\/]@supabase[\\/]/,
                        name: 'supabase',
                        chunks: 'all',
                        priority: 30,
                    },
                },
            };
        }
        return config;
    },
};

module.exports = nextConfig;
