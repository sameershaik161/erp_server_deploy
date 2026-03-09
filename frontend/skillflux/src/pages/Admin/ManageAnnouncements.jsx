import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import {
  Container, Typography, Paper, Button, Stack, TextField, Box, Chip,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, MenuItem, Tabs, Tab, IconButton
} from "@mui/material";
import { Add, Delete, Edit, Campaign } from "@mui/icons-material";
import { toast } from "react-toastify";

export default function ManageAnnouncements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState(0); // 0: all, 1: academic, 2: career
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "academic",
    company: "",
    location: "",
    deadline: "",
    eligibilityCriteria: "",
    applyLink: "",
    package: "",
    eventDate: "",
    venue: "",
    isPinned: false,
    targetYear: null
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const type = tab === 1 ? "academic" : tab === 2 ? "career_opportunity" : "";
      const url = type ? `/announcements/admin/all?type=${type}` : "/announcements/admin/all";
      const res = await axios.get(url);
      setList(res.data);
    } catch (err) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await axios.put(`/announcements/${editId}`, formData);
        toast.success("Announcement updated!");
      } else {
        await axios.post("/announcements", formData);
        toast.success("Announcement created!");
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`/announcements/${id}`);
      toast.success("Deleted!");
      loadData();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      type: item.type,
      company: item.company || "",
      location: item.location || "",
      deadline: item.deadline ? item.deadline.split("T")[0] : "",
      eligibilityCriteria: item.eligibilityCriteria || "",
      applyLink: item.applyLink || "",
      package: item.package || "",
      eventDate: item.eventDate ? item.eventDate.split("T")[0] : "",
      venue: item.venue || "",
      isPinned: item.isPinned || false,
      targetYear: item.targetYear || null
    });
    setEditMode(true);
    setEditId(item._id);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "academic",
      company: "",
      location: "",
      deadline: "",
      eligibilityCriteria: "",
      applyLink: "",
      package: "",
      eventDate: "",
      venue: "",
      isPinned: false,
      targetYear: null
    });
    setEditMode(false);
    setEditId(null);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Manage Announcements</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          Create Announcement
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="All" />
        <Tab label="Academic" />
        <Tab label="Career Opportunities" />
      </Tabs>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : list.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          No announcements yet
        </Typography>
      ) : (
        list.map((item) => (
          <Paper key={item._id} sx={{ p: 3, mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6">{item.title}</Typography>
                  {item.isPinned && <Chip label="Pinned" color="error" size="small" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip 
                    label={item.type === "academic" ? "Academic" : "Career"} 
                    size="small" 
                    color={item.type === "academic" ? "primary" : "success"}
                  />
                  {item.targetYear && <Chip label={`Year ${item.targetYear}`} size="small" />}
                  <Chip label={`Views: ${item.viewCount || 0}`} size="small" variant="outlined" />
                </Stack>
                
                {item.type === "career_opportunity" && (
                  <Box sx={{ mt: 2 }}>
                    {item.company && <Typography variant="body2"><strong>Company:</strong> {item.company}</Typography>}
                    {item.package && <Typography variant="body2"><strong>Package:</strong> {item.package}</Typography>}
                    {item.location && <Typography variant="body2"><strong>Location:</strong> {item.location}</Typography>}
                    {item.deadline && <Typography variant="body2" color="error"><strong>Deadline:</strong> {new Date(item.deadline).toLocaleDateString()}</Typography>}
                    {item.applyLink && (
                      <Typography variant="body2">
                        <strong>Apply Link:</strong> <a href={item.applyLink} target="_blank" rel="noopener noreferrer">Link</a>
                      </Typography>
                    )}
                  </Box>
                )}
                
                {item.type === "academic" && item.eventDate && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2"><strong>Event Date:</strong> {new Date(item.eventDate).toLocaleDateString()}</Typography>
                    {item.venue && <Typography variant="body2"><strong>Venue:</strong> {item.venue}</Typography>}
                  </Box>
                )}
              </Box>
              
              <Stack spacing={1}>
                <IconButton size="small" onClick={() => handleEdit(item)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(item._id)} color="error">
                  <Delete />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        ))
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        disableRestoreFocus
        disableEnforceFocus={false}
        aria-labelledby="announcement-dialog-title"
        aria-describedby="announcement-dialog-description"
      >
        <DialogTitle id="announcement-dialog-title">{editMode ? "Edit" : "Create"} Announcement</DialogTitle>
        <DialogContent id="announcement-dialog-description">
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="career_opportunity">Career Opportunity</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Target Year"
                value={formData.targetYear || ""}
                onChange={(e) => setFormData({ ...formData, targetYear: e.target.value || null })}
              >
                <MenuItem value="">All Years</MenuItem>
                <MenuItem value={1}>1st Year</MenuItem>
                <MenuItem value={2}>2nd Year</MenuItem>
                <MenuItem value={3}>3rd Year</MenuItem>
                <MenuItem value={4}>4th Year</MenuItem>
              </TextField>
            </Grid>

            {formData.type === "career_opportunity" && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Package"
                    value={formData.package}
                    onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Deadline"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Eligibility Criteria"
                    value={formData.eligibilityCriteria}
                    onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Apply Link"
                    value={formData.applyLink}
                    onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                  />
                </Grid>
              </>
            )}

            {formData.type === "academic" && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Event Date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
