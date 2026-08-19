import Box from "@mui/material/Box";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/** Shell da área pública (sem autenticação): cabeçalho + conteúdo + rodapé. */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
