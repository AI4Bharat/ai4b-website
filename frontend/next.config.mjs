/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/",
      },
    ];
  },
  images: {
    domains: ["localhost"], // Replace 'example.com' with the hostname of your image source
  },
};

export default nextConfig;
