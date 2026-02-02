/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    optimizeFonts: false,
    transpilePackages: ['three', '@react-three/postprocessing', 'postprocessing']
};

module.exports = nextConfig;
