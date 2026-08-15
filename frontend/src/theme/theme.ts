"use client";

import { createTheme } from "@mui/material/styles";
import { LinkBehavior } from "@/components/LinkBehavior";

/**
 * Tema central do AcadEvent (MUI).
 *
 * Regra do time: nunca usar cor hex hardcoded em componentes. Sempre consumir
 * `theme.palette.*` / `theme.spacing()` via prop `sx` ou `styled`. Ver
 * frontend/docs/decisoes-de-design.md §"Convenções de implementação (MUI)".
 *
 * TODO(marca): a cor `primary` abaixo é um placeholder (azul acadêmico) até a
 * identidade visual/logo ser definida (RF01.1.4). Ao fechar a marca, trocar
 * apenas `primary.main` — o MUI deriva hover/active/contraste automaticamente.
 *
 * Modo escuro: adiado (decisão). MUI suporta via `palette.mode`; introduzir em
 * fase posterior com um segundo tema.
 */
export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      // TODO(marca): placeholder — derivar do logo.
      main: "#1f4e8c",
    },
    secondary: {
      main: "#c2410c",
    },
    // success/warning/error/info seguem o padrão MUI (tokens dos RFs de status).
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    // Mantém Geist (configurada em src/app/layout.tsx via next/font).
    fontFamily: "var(--font-geist-sans), Roboto, Helvetica, Arial, sans-serif",
  },
  components: {
    // Navegação client-side via next/link em todos os componentes de link.
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});

export default theme;
