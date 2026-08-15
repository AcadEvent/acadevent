import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { Breakpoint } from "@mui/material/styles";

export interface SectionProps {
  children: ReactNode;
  /** Título opcional da seção. */
  title?: string;
  subtitle?: string;
  /** Largura máxima do Container (padrão "lg"). Use false para largura total. */
  maxWidth?: Breakpoint | false;
  /** Cor de fundo via token do tema (ex.: "background.paper"). */
  bgcolor?: string;
  /** Espaçamento vertical (theme.spacing). */
  py?: number;
}

/**
 * Faixa de conteúdo com Container interno. Sem componente próprio no MUI —
 * composto de Box/Container/Stack. Padroniza espaçamento e largura das seções
 * (landing, páginas públicas).
 */
export default function Section({
  children,
  title,
  subtitle,
  maxWidth = "lg",
  bgcolor,
  py = 8,
}: SectionProps) {
  return (
    <Box component="section" sx={{ py: { xs: py / 2, md: py }, bgcolor }}>
      <Container maxWidth={maxWidth}>
        {(title || subtitle) && (
          <Stack spacing={1} sx={{ mb: 4 }}>
            {title && (
              <Typography variant="h4" component="h2">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography color="text.secondary">{subtitle}</Typography>
            )}
          </Stack>
        )}
        {children}
      </Container>
    </Box>
  );
}
