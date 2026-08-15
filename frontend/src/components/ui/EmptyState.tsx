import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InboxIcon from "@mui/icons-material/Inbox";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Ícone opcional; padrão é uma caixa vazia. */
  icon?: ReactNode;
  /** Ação opcional (ex.: botão "Criar evento"). */
  action?: ReactNode;
}

/**
 * Estado vazio reutilizável (componente de domínio, Fase 3). Usar em listagens
 * sem resultados. Composto de Box/Stack/Typography, sem cor hardcoded.
 */
export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        alignItems: "center",
        py: { xs: 6, md: 8 },
        px: 2,
        textAlign: "center",
        color: "text.secondary",
      }}
    >
      <Box sx={{ color: "text.disabled", display: "inline-flex" }}>
        {icon ?? <InboxIcon sx={{ fontSize: 48 }} />}
      </Box>
      <Typography variant="h6" component="p" color="text.primary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Stack>
  );
}
