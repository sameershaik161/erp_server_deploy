import React from "react";
import { Card, CardContent, Typography, Chip, Box, Stack, CardActions, Button } from "@mui/material";
import { getFileUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axiosInstance";
import { toast } from "react-toastify";

export default function AchievementCard({ achievement, refresh, onDelete }) {
  const { user } = useAuth();

  const deleteAchievement = async () => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) return;
    try {
      await axios.delete(`/achievements/${achievement._id}`);
      toast.success("Achievement deleted");
      if (refresh) refresh();
      if (onDelete) onDelete();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Error deleting achievement");
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          {achievement.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {achievement.description || "No description provided"}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip label={achievement.category} color="primary" size="small" />
          <Chip
            label={achievement.status.toUpperCase()}
            color={
              achievement.status === "approved"
                ? "success"
                : achievement.status === "rejected"
                ? "error"
                : "warning"
            }
            size="small"
          />
        </Stack>

        <Typography variant="body2" sx={{ mt: 1 }}>
          Level: <strong>{achievement.level}</strong>
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Date: {new Date(achievement.dateOfIssue || achievement.date).toLocaleDateString()}
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Institute: <strong>{achievement.organizedInstitute}</strong>
        </Typography>

        {achievement.status === "approved" && achievement.proofFiles?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }} color="primary">
              📄 Achievement Documents:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {achievement.proofFiles.map((file, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  href={getFileUrl(file)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    minWidth: 'auto'
                  }}
                >
                  Document {idx + 1}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {achievement.status === "pending" && achievement.points > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }} color="warning.main">
            Estimated Points: <strong>{achievement.points}</strong> (Pending Approval)
          </Typography>
        )}

        {achievement.status === "approved" && achievement.points > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }} color="success.main">
            ✅ Points Awarded: <strong>{achievement.points}</strong>
          </Typography>
        )}
      </CardContent>

      {user?.role === "student" && (
        <CardActions>
          <Button size="small" color="error" onClick={deleteAchievement}>
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
