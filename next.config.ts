import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chrome headless do /api/pdf: binário e driver ficam fora do bundle.
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core", "playwright"],
  // Binários do Chromium e arquivos de dados do playwright-core não são detectados pelo file tracing.
  outputFileTracingIncludes: { "/api/pdf": ["./node_modules/@sparticuz/chromium/bin/**", "./node_modules/playwright-core/**"] },
};

export default nextConfig;
