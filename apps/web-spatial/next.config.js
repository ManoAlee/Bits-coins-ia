/** @type {import('next').NextConfig} */
const nextConfig = {
    optimizeFonts: false,
    transpilePackages: ['three', '@react-three/postprocessing', 'postprocessing']
};

module.exports = nextConfig;
