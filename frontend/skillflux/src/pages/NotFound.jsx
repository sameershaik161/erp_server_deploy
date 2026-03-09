import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Typography variant="h3" fontWeight={600} color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The page you’re looking for doesn’t exist or was moved.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{ textTransform: "none", px: 4 }}
      >
        Go to Home
      </Button>
    </Box>
  );
}
