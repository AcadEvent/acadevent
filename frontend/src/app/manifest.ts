import type { MetadataRoute } from "next";

/**
 * Web App Manifest — base do PWA (RNF04.2 "PWA gerado a partir do site").
 *
 * Cobre o mínimo para instalação (nome, cores, display standalone). O service
 * worker para funcionamento offline e as notificações push (RF09.5) ficam
 * briefados para uma fase posterior — validar compatibilidade com Next 16.
 *
 * TODO(marca): trocar `theme_color`/`background_color` e adicionar ícones reais
 * (192px e 512px) quando o logo existir (RF01.1.4).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AcadEvent — Gestão de Eventos Acadêmicos",
    short_name: "AcadEvent",
    description:
      "Descoberta, inscrição e gestão completa de eventos acadêmicos.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1f4e8c",
    lang: "pt-BR",
    icons: [
      // TODO(marca): substituir por ícones PNG reais 192x192 e 512x512.
    ],
  };
}
