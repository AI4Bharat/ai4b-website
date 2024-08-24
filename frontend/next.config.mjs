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
    domains: ["localhost", "e5e4-91-203-135-89.ngrok-free.app"], // Replace 'example.com' with the hostname of your image source
  },
};

export default nextConfig;
