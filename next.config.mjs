/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "videos.pexels.com" }
    ]
  },
  async redirects() {
    return [
      { source: "/why-duli", destination: "/about", permanent: true },

      // The app moved out of /dashboard/* to the top level (spec page map), so
      // anyone holding an old link keeps working.
      { source: "/dashboard/projects", destination: "/projects", permanent: true },
      { source: "/dashboard/projects/:path*", destination: "/projects/:path*", permanent: true },
      { source: "/dashboard/settings", destination: "/settings", permanent: true },
      // Ideas is public and always was; the in-app duplicate is retired.
      { source: "/dashboard/ideas", destination: "/ideas", permanent: true }
    ];
  }
};

export default nextConfig;
