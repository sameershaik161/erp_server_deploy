import { useState } from "react";
import { Button, LinearProgress, Typography, Box } from "@mui/material";

export default function FileUpload({ label, onFileSelect, accept }) {
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    await onFileSelect(file);
    setUploading(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      <Button
        variant="contained"
        component="label"
        sx={{
          textTransform: "none",
          fontWeight: 500,
          backgroundColor: "#1976d2",
          "&:hover": { backgroundColor: "#115293" },
        }}
      >
        Choose File
        <input type="file" hidden accept={accept} onChange={handleFileChange} />
      </Button>

      {fileName && (
        <Typography variant="body2" sx={{ mt: 1, color: "gray" }}>
          Selected: {fileName}
        </Typography>
      )}

      {uploading && <LinearProgress sx={{ mt: 1 }} />}
    </Box>
  );
}
