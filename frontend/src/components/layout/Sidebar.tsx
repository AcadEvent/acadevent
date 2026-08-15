"use client";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Box from "@mui/material/Box";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface SidebarProps {
  title: string;
  items: SidebarItem[];
}

/**
 * Navegação lateral reutilizável para as áreas autenticadas (painel, gerenciar,
 * admin). Marca o item ativo via rota atual. Cada shell passa seus próprios
 * itens. Client component por causa do `usePathname`.
 */
export default function Sidebar({ title, items }: SidebarProps) {
  const pathname = usePathname() ?? "";

  return (
    <Box
      component="nav"
      sx={{
        width: { xs: "100%", md: 260 },
        flexShrink: 0,
        borderRight: { md: 1 },
        borderColor: { md: "divider" },
      }}
    >
      <List
        subheader={
          <ListSubheader disableSticky sx={{ bgcolor: "transparent", fontWeight: 700 }}>
            {title}
          </ListSubheader>
        }
      >
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <ListItemButton
              key={item.href}
              component={NextLink}
              href={item.href}
              selected={active}
            >
              {item.icon && <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
