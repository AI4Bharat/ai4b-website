/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  basePath: isProd ? "/ai4b-website" : "",
  output: "export",
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
    unoptimized: true,
    domains: ["localhost", "admin.models.ai4bharat.org"], // Replace 'example.com' with the hostname of your image source
  },
};

export default nextConfig;
