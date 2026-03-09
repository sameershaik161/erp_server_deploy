import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { Container, Typography, Paper, Button, Stack, TextField, Box, Chip, CircularProgress, Tabs, Tab, Collapse, Alert, LinearProgress, Divider } from "@mui/material";
import { toast } from "react-toastify";
import { Psychology, TipsAndUpdates, Download, Visibility } from "@mui/icons-material";
import { getFileUrl } from "../../config/api";
import CertificateValidationPanel from "../../components/CertificateValidationPanel";

export default function ManageAchievements() {
  const location = useLocation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(location.state?.filterStatus === 'pending' ? 0 : 0);
  const [pointsInput, setPointsInput] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = [
    "All",
    "Academic Certifications",
    "Sports Competition Certification",
    "Cultural Certification",
    "Co-ordinator Certificates"
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const status = tab === 0 ? "pending" : tab === 1 ? "approved" : "rejected";
      const categoryParam = categoryFilter !== "All" ? `&category=${encodeURIComponent(categoryFilter)}` : "";
      const res = await axios.get(`/admin/achievements?status=${status}${categoryParam}`);
      setList(res.data);
    } catch (err) {
      console.error("Failed to load achievements:", err);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [tab, categoryFilter]);

  const approve = async (id) => {
    const points = pointsInput[id] || 50;
    try {
      await axios.put(`/admin/achievements/${id}/verify`, { action: "approve", points });
      toast.success(`Approved with ${points} points!`);
      loadData();
      setPointsInput({ ...pointsInput, [id]: undefined });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve");
    }
  };

  const reject = async (id) => {
    try {
      await axios.put(`/admin/achievements/${id}/verify`, { action: "reject" });
      toast.error("Rejected!");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    }
  };

  const analyzeWithAI = async (achievement) => {
    try {
      setAnalyzingId(achievement._id);
      console.log("Analyzing achievement:", achievement);

      const res = await axios.post("/admin/analyze-certificate", {
        title: achievement.title || "",
        description: achievement.description || "",
        category: achievement.category || "",
        level: achievement.level || ""
      });

      console.log("AI Analysis response:", res.data);
      setAiAnalysis({ ...aiAnalysis, [achievement._id]: res.data });

      // Auto-set recommended points
      if (res.data.recommended_points) {
        setPointsInput({ ...pointsInput, [achievement._id]: res.data.recommended_points });
      }
      toast.success("AI Analysis Complete!");
    } catch (err) {
      console.error("AI Analysis error:", err);
      const errorMsg = err.response?.data?.message || err.message || "AI Analysis failed";
      toast.error(errorMsg);
    } finally {
      setAnalyzingId(null);
    }
  };

  const downloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(getFileUrl(fileUrl));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || fileUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  };

  const downloadAllFiles = async () => {
    try {
      if (list.length === 0) {
        toast.warning('No achievements to download');
        return;
      }

      for (const achievement of list) {
        if (achievement.proofFiles && achievement.proofFiles.length > 0) {
          for (let i = 0; i < achievement.proofFiles.length; i++) {
            const file = achievement.proofFiles[i];
            const fileName = `${achievement.student?.rollNumber}_${achievement.title.replace(/[^a-zA-Z0-9]/g, '_')}_${i + 1}.${file.split('.').pop()}`;
            await downloadFile(file, fileName);
            // Add delay to prevent overwhelming the browser
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      toast.success(`Downloaded files from ${list.length} achievements`);
    } catch (err) {
      console.error('Bulk download error:', err);
      toast.error('Failed to download all files');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Manage Achievements</Typography>
        <Button 
          variant="contained" 
          startIcon={<Download />}
          onClick={downloadAllFiles}
          disabled={list.length === 0}
          sx={{ 
            backgroundColor: '#10B981', 
            '&:hover': { backgroundColor: '#059669' },
            '&:disabled': { backgroundColor: '#D1D5DB' }
          }}
        >
          Download All Proof Files ({list.filter(a => a.proofFiles?.length > 0).length})
        </Button>
      </Stack>
      
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Pending" />
        <Tab label="Approved" />
        <Tab label="Rejected" />
      </Tabs>

      {/* Category Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Filter by Category:</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setCategoryFilter(cat)}
              color={categoryFilter === cat ? "primary" : "default"}
              variant={categoryFilter === cat ? "filled" : "outlined"}
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : list.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          No {tab === 0 ? "pending" : tab === 1 ? "approved" : "rejected"} achievements
        </Typography>
      ) : (
        list.map((a) => (
          <Paper key={a._id} sx={{ p: 3, my: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{a.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {a.description || "No description"}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip label={a.category} size="small" />
                  <Chip label={a.level} size="small" color="primary" />
                  <Chip label={new Date(a.date).toLocaleDateString()} size="small" variant="outlined" />
                </Stack>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Student:</strong> {a.student?.name} ({a.student?.rollNumber})
                </Typography>
                <Typography variant="body2">
                  <strong>Section:</strong> {a.student?.section}
                </Typography>
                {a.proofFiles?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2"><strong>Proof Files:</strong></Typography>
                    {a.proofFiles.map((file, idx) => (
                      <Box key={idx} sx={{ display: 'inline-flex', gap: 1, mr: 2, mt: 0.5 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => window.open(getFileUrl(file), '_blank')}
                        >
                          View File {idx + 1}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<Download />}
                          onClick={() => downloadFile(file, `${a.student?.rollNumber}_${a.title.replace(/[^a-zA-Z0-9]/g, '_')}_${idx + 1}.${file.split('.').pop()}`)}
                        >
                          Download
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
                {a.points > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }} color="primary">
                    <strong>Points Awarded:</strong> {a.points}
                  </Typography>
                )}
              </Box>
            </Stack>

            {tab === 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Button
                  startIcon={analyzingId === a._id ? <CircularProgress size={16} /> : <Psychology />}
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => analyzeWithAI(a)}
                  disabled={analyzingId === a._id}
                  sx={{ mb: 2 }}
                >
                  {analyzingId === a._id ? "Analyzing..." : "🤖 AI Analyze Certificate"}
                </Button>

                {aiAnalysis[a._id] && (
                  <Collapse in={Boolean(aiAnalysis[a._id])}>
                    <Paper sx={{ p: 2, mb: 2, bgcolor: "info.light", color: "info.contrastText" }}>
                      <Typography variant="subtitle2" gutterBottom>
                        <TipsAndUpdates fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
                        AI Assessment
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Credibility Score: {aiAnalysis[a._id].credibility_score}/100
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={aiAnalysis[a._id].credibility_score}
                          sx={{ mt: 0.5, height: 8, borderRadius: 1 }}
                          color={aiAnalysis[a._id].credibility_score >= 80 ? "success" : aiAnalysis[a._id].credibility_score >= 60 ? "primary" : "warning"}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip label={aiAnalysis[a._id].assessment_level} size="small" color="primary" />
                          <Chip label={`AI Confidence: ${aiAnalysis[a._id].ai_confidence}`} size="small" />
                        </Stack>
                      </Box>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Summary:</strong> {aiAnalysis[a._id].summary}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Recommended Points:</strong> {aiAnalysis[a._id].recommended_points}
                      </Typography>

                      {aiAnalysis[a._id].key_highlights?.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Key Highlights:</strong></Typography>
                          {aiAnalysis[a._id].key_highlights.map((h, i) => (
                            <Typography key={i} variant="caption" display="block">• {h}</Typography>
                          ))}
                        </Box>
                      )}

                      {aiAnalysis[a._id].skills_identified?.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Skills Identified:</strong></Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {aiAnalysis[a._id].skills_identified.map((skill, i) => (
                              <Chip key={i} label={skill} size="small" variant="outlined" />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {aiAnalysis[a._id].red_flags?.length > 0 && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          <strong>Red Flags:</strong>
                          {aiAnalysis[a._id].red_flags.map((flag, i) => (
                            <Typography key={i} variant="caption" display="block">• {flag}</Typography>
                          ))}
                        </Alert>
                      )}
                    </Paper>
                  </Collapse>
                )}

                {/* Certificate Validation Panel */}
                {a.status === 'pending' && (
                  <CertificateValidationPanel
                    achievement={a}
                    onValidationComplete={(validation) => {
                      // Update the achievement with validation results
                      setList(prevList =>
                        prevList.map(item =>
                          item._id === a._id
                            ? { ...item, validationResult: validation }
                            : item
                        )
                      );
                    }}
                  />
                )}

                {a.status === 'pending' && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      label="Points"
                      type="number"
                      size="small"
                      value={pointsInput[a._id] || 50}
                      onChange={(e) => setPointsInput({ ...pointsInput, [a._id]: parseInt(e.target.value) })}
                      sx={{ width: 100 }}
                    />
                    <Button variant="contained" color="success" onClick={() => approve(a._id)}>
                      Approve
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => reject(a._id)}>
                      Reject
                    </Button>
                  </Stack>
                )}
              </>
            )}
          </Paper>
        ))
      )}
    </Container>
  );
}
