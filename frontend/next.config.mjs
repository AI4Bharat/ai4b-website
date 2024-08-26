/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/:path*",
  //       destination: "/",
  //     },
  //   ];
  // },
  images: {
    domains: ["localhost", "admin.models.ai4bharat.org"], // Replace 'example.com' with the hostname of your image source
  },
};

export default nextConfig;
