import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import {
  Container, Typography, Paper, Box, Chip, CircularProgress, Tabs, Tab,
  Stack, Link, Divider, Alert, Grid
} from "@mui/material";
import { Campaign, WorkOutline, School, Schedule, LocationOn, Whatshot } from "@mui/icons-material";
import { toast } from "react-toastify";

export default function Announcements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: all, 1: academic, 2: career

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const type = tab === 1 ? "academic" : tab === 2 ? "career_opportunity" : "";
      const url = type ? `/announcements/active?type=${type}` : "/announcements/active";
      const res = await axios.get(url);
      setList(res.data);
    } catch (err) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      await axios.post(`/announcements/${id}/view`);
    } catch (err) {
      // Silent fail for view count
    }
  };

  const isDeadlineNear = (deadline) => {
    if (!deadline) return false;
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && daysLeft >= 0;
  };

  const isExpired = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Campaign color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" fontWeight={600}>Announcements</Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with latest academic events and career opportunities
          </Typography>
        </Box>
      </Stack>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<Campaign />} label="All" iconPosition="start" />
        <Tab icon={<School />} label="Academic" iconPosition="start" />
        <Tab icon={<WorkOutline />} label="Career Opportunities" iconPosition="start" />
      </Tabs>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : list.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No announcements at the moment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for updates
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {list.map((item) => (
            <Paper 
              key={item._id} 
              sx={{ 
                p: 3, 
                position: "relative",
                border: item.isPinned ? "2px solid" : "none",
                borderColor: item.isPinned ? "error.main" : "transparent",
                bgcolor: item.isPinned ? "error.lighter" : "background.paper"
              }}
              onClick={() => handleView(item._id)}
            >
              {item.isPinned && (
                <Chip 
                  label="📌 PINNED" 
                  color="error" 
                  size="small" 
                  sx={{ position: "absolute", top: 12, right: 12 }}
                />
              )}

              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: item.type === "academic" ? "primary.light" : "success.light",
                    color: "white"
                  }}
                >
                  {item.type === "academic" ? <School /> : <WorkOutline />}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: "pre-line" }}>
                    {item.description}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                    <Chip 
                      label={item.type === "academic" ? "Academic" : "Career Opportunity"} 
                      size="small"
                      color={item.type === "academic" ? "primary" : "success"}
                    />
                    {item.targetYear && (
                      <Chip label={`For Year ${item.targetYear}`} size="small" variant="outlined" />
                    )}
                    <Chip 
                      label={`Posted ${new Date(item.createdAt).toLocaleDateString()}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Stack>

                  {item.type === "career_opportunity" && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: "success.lighter", borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        {item.company && (
                          <Grid item xs={12} sm={6}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <WorkOutline fontSize="small" color="action" />
                              <Typography variant="body2">
                                <strong>Company:</strong> {item.company}
                              </Typography>
                            </Stack>
                          </Grid>
                        )}
                        {item.package && (
                          <Grid item xs={12} sm={6}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">
                                <strong>💰 Package:</strong> {item.package}
                              </Typography>
                            </Stack>
                          </Grid>
                        )}
                        {item.location && (
                          <Grid item xs={12} sm={6}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LocationOn fontSize="small" color="action" />
                              <Typography variant="body2">
                                <strong>Location:</strong> {item.location}
                              </Typography>
                            </Stack>
                          </Grid>
                        )}
                        {item.deadline && (
                          <Grid item xs={12} sm={6}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Schedule fontSize="small" color={isDeadlineNear(item.deadline) ? "error" : "action"} />
                              <Typography 
                                variant="body2" 
                                color={isExpired(item.deadline) ? "error" : isDeadlineNear(item.deadline) ? "warning.main" : "text.primary"}
                                fontWeight={isDeadlineNear(item.deadline) ? 600 : 400}
                              >
                                <strong>Deadline:</strong> {new Date(item.deadline).toLocaleDateString()}
                                {isDeadlineNear(item.deadline) && !isExpired(item.deadline) && (
                                  <Chip label="Urgent!" color="error" size="small" sx={{ ml: 1 }} />
                                )}
                                {isExpired(item.deadline) && (
                                  <Chip label="Expired" color="error" size="small" sx={{ ml: 1 }} />
                                )}
                              </Typography>
                            </Stack>
                          </Grid>
                        )}
                      </Grid>

                      {item.eligibilityCriteria && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Eligibility:</strong> {item.eligibilityCriteria}
                          </Typography>
                        </Box>
                      )}

                      {item.applyLink && !isExpired(item.deadline) && (
                        <Box sx={{ mt: 2 }}>
                          <Link 
                            href={item.applyLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            underline="none"
                          >
                            <Chip 
                              label="🔗 Apply Now" 
                              color="success" 
                              clickable
                              sx={{ fontWeight: 600 }}
                            />
                          </Link>
                        </Box>
                      )}
                    </Box>
                  )}

                  {item.type === "academic" && (item.eventDate || item.venue) && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: "primary.lighter", borderRadius: 1 }}>
                      {item.eventDate && (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Schedule fontSize="small" color="primary" />
                          <Typography variant="body2">
                            <strong>Event Date:</strong> {new Date(item.eventDate).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      )}
                      {item.venue && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOn fontSize="small" color="primary" />
                          <Typography variant="body2">
                            <strong>Venue:</strong> {item.venue}
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  )}
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}
