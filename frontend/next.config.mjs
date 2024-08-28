const repo = "ai4b-website";

let assetPrefix = `/${repo}/`;
let basePath = `/${repo}`;

const nextConfig = {
  assetPrefix: process.env.GITHUB_ACTIONS ? assetPrefix : "",
  basePath: process.env.GITHUB_ACTIONS ? basePath : "",
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
