import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Reporting-Endpoints",
            value: 'default="/api/csp-report"',
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.openai.com https://cdn.platform.openai.com https://chatgpt.com https://sentinel.openai.com https://browser-intake-datadoghq.com https://api-js.mixpanel.com",
              "style-src 'self' 'unsafe-inline' https://*.openai.com https://cdn.openai.com",
              "img-src 'self' data: blob: https: https://*.openai.com https://*.oaiusercontent.com",
              "font-src 'self' data: https://cdn.openai.com https://*.openai.com",
              "connect-src 'self' https://*.openai.com https://api.openai.com https://*.oaiusercontent.com https://browser-intake-datadoghq.com https://api-js.mixpanel.com https://chatgpt.com https://sentinel.openai.com",
              "frame-src 'self' https://*.openai.com https://cdn.platform.openai.com https://chatgpt.com https://sentinel.openai.com",
              "worker-src 'self' blob:",
              "child-src 'self' blob: https://*.openai.com",
              "media-src 'self' blob: https://*.openai.com",
              "report-to default",
            ].join("; "),
          },
          {
            key: "Permissions-Policy",
            value: 'fullscreen=(self "https://cdn.platform.openai.com" "https://sentinel.openai.com" "https://chatgpt.com" "https://cdn.openai.com"), picture-in-picture=(self "https://cdn.platform.openai.com" "https://sentinel.openai.com" "https://chatgpt.com" "https://cdn.openai.com"), display-capture=*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
