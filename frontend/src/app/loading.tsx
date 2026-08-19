import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * Estado de carregamento padrão do App Router. Rotas com listas devem, quando
 * implementadas, fornecer um loading.tsx próprio com Skeletons mais específicos.
 */
export default function Loading() {
  return (
    <Box
      sx={{
        minHeight: "50dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress aria-label="Carregando" />
    </Box>
  );
}
