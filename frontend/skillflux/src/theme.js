import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" },
    secondary: { main: "#f50057" },
    background: { default: "#f9f9f9" },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h6: { fontWeight: 600 },
  },
});

export default theme;
