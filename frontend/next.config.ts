import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixa a raiz do projeto neste diretório: há um package-lock.json fora do
  // repositório (em ~) que o Next inferiria como raiz do workspace.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
