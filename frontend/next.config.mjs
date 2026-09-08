const nextConfig = {
  reactStrictMode: false,
  output: "export",
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ["localhost", "admin.models.ai4bharat.org"], // Replace 'example.com' with the hostname of your image source
  },
// redirects removed because output: export does not support custom routes/redirects
};

export default nextConfig;
