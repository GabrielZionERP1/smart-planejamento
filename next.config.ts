import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações de performance
  reactStrictMode: true,
  
  // Desabilitar source maps em dev para compilar mais rápido
  productionBrowserSourceMaps: false,
  
  // Otimizar imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Experimental: Turbopack (já habilitado via --turbopack)
  experimental: {
    turbo: {
      resolveAlias: {
        // Aliases podem acelerar resolução de módulos
      },
    },
  },
};

export default nextConfig;
