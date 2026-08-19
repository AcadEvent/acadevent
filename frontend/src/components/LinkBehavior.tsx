"use client";

import { forwardRef } from "react";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";

/**
 * Integração de navegação: faz os componentes MUI (Button, Link, ListItemButton,
 * CardActionArea…) usarem o `next/link` para navegação client-side.
 *
 * Registrado no tema (src/theme/theme.ts) como `LinkComponent` do MuiButtonBase
 * e `component` do MuiLink. Assim as páginas usam apenas `href="…"` (string
 * serializável) — sem passar componentes de Server para Client Components.
 */
export const LinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<NextLinkProps, "href"> & { href: NextLinkProps["href"] }
>(function LinkBehavior(props, ref) {
  const { href, ...other } = props;
  return <NextLink ref={ref} href={href} {...other} />;
});

export default LinkBehavior;
