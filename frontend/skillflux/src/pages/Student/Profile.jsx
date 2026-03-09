import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import { Container, Typography, Avatar, Button, Box, CircularProgress, Paper, Divider, Card, Grid, Chip, IconButton, LinearProgress, Tab, Tabs, Badge, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, MapPin, Calendar, Award, Trophy, Star, 
  Upload, FileText, Download, Camera, Edit2, Save, X, 
  Github, Linkedin, Twitter, Globe, Book, Briefcase, 
  TrendingUp, Target, Zap, Shield, CheckCircle, Clock,
  Medal, Plus, DollarSign
} from "lucide-react";
import { getFileUrl } from "../../config/api";
import ERPStatus from "../../components/ERPStatus";
import ViewUploadedFiles from "../../components/ViewUploadedFiles";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [erpData, setErpData] = useState(null);
  const [file, setFile] = useState(null);
  const [banner, setBanner] = useState(null);
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [stats, setStats] = useState({
    achievements: 0,
    rank: 0,
    completionRate: 0,
    badges: 0
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    year: "",
    section: "",
    socialLinks: {
      leetcode: "",
      linkedin: "",
      codechef: "",
      github: "",
      portfolio: ""
    }
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const fetchProfile = async () => {
    try {
      const [profileRes, achievementsRes, rankRes, erpRes] = await Promise.all([
        axios.get("/auth/me"),
        axios.get("/achievements/me").catch((err) => {
          console.log("Achievements fetch error:", err.response?.data);
          return { data: [] };
        }),
        axios.get("/auth/my-rank").catch((err) => {
          console.log("Rank fetch error:", err.response?.data);
          return { data: { rank: 0 } };
        }),
        axios.get("/erp/my-erp").catch((err) => {
          console.warn("ERP data not found:", err.response?.status);
          return { data: null };
        })
      ]);
      setProfile(profileRes.data);
      setErpData(erpRes.data);
      
      // Calculate stats from actual data
      const approved = achievementsRes.data.filter(a => a.status === 'approved');
      setStats({
        achievements: achievementsRes.data.length,
        rank: rankRes.data.rank || 0,
        completionRate: achievementsRes.data.length > 0 
          ? Math.round((approved.length / achievementsRes.data.length) * 100)
          : 0,
        badges: Math.floor(approved.length / 5) // Badge per 5 achievements
      });
      
      // Initialize edit form data with current profile
      setEditFormData({
        name: profileRes.data.name || "",
        year: profileRes.data.year || "",
        section: profileRes.data.section || "",
        socialLinks: profileRes.data.socialLinks || {
          leetcode: "",
          linkedin: "",
          codechef: "",
          github: "",
          portfolio: ""
        }
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      console.error("Error details:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to load profile");
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === 'profile') {
        setFile(e.dataTransfer.files[0]);
      } else {
        setResume(e.dataTransfer.files[0]);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfilePic = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    
    console.log("Uploading profile picture:", file.name, file.type, file.size);
    
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("profilePic", file);
      
      console.log("FormData created, sending request...");
      const res = await axios.post("/auth/upload-profile", fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Upload response:", res.data);
      toast.success(res.data.message || "Profile picture updated!");
      setFile(null);
      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      console.error("Upload failed:", err);
      console.error("Error details:", err.response?.data);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleBanner = async () => {
    if (!banner) {
      toast.error("Please select a banner image first");
      return;
    }
    
    console.log("Uploading banner:", banner.name, banner.type, banner.size);
    
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("banner", banner);
      
      console.log("FormData created, sending request...");
      const res = await axios.post("/auth/upload-banner", fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Upload response:", res.data);
      toast.success(res.data.message || "Banner updated!");
      setBanner(null);
      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      console.error("Upload failed:", err);
      console.error("Error details:", err.response?.data);
      toast.error(err.response?.data?.message || "Banner upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleResume = async () => {
    if (!resume) {
      toast.error("Please select a file first");
      return;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("resume", resume);
      const res = await axios.post("/auth/upload-resume", fd);
      toast.success(res.data.message || "Resume uploaded!");
      setResume(null);
      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenEditDialog = () => {
    setEditFormData({
      name: profile.name || "",
      year: profile.year || "",
      section: profile.section || "",
      socialLinks: profile.socialLinks || {
        leetcode: "",
        linkedin: "",
        codechef: "",
        github: "",
        portfolio: ""
      }
    });
    setEditDialogOpen(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdatingProfile(true);
      
      // Validate name
      if (!editFormData.name || editFormData.name.trim().length < 2) {
        toast.error("Name must be at least 2 characters long");
        return;
      }
      
      // Validate year
      if (!editFormData.year) {
        toast.error("Please select your year");
        return;
      }
      
      // Validate section
      if (!editFormData.section) {
        toast.error("Please select your section");
        return;
      }
      
      const res = await axios.put("/auth/update-profile", {
        name: editFormData.name.trim(),
        year: editFormData.year,
        section: editFormData.section,
        socialLinks: editFormData.socialLinks
      });
      
      toast.success(res.data.message || "Profile updated successfully!");
      setEditDialogOpen(false);
      
      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <CircularProgress />
    </Box>
  );

  if (!profile) return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Container sx={{ pt: 8 }}>
        <Card className="p-8 text-center">
          <Typography variant="h6" className="text-gray-600">Failed to load profile</Typography>
          <Button onClick={fetchProfile} className="mt-4">Retry</Button>
        </Card>
      </Container>
    </Box>
  );

  const statCards = [
    { title: "Total Points", value: profile.totalPoints || 0, icon: Trophy, color: "#F59E0B" },
    { title: "Achievements", value: stats.achievements, icon: Award, color: "#3B82F6" },
    { title: "Your Rank", value: `#${stats.rank}`, icon: Medal, color: "#A855F7" },
    { title: "Completion", value: `${stats.completionRate}%`, icon: Target, color: "#10B981" }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* Hero Section with Cover */}
      <Box sx={{ 
        position: 'relative', 
        height: '16rem', 
        backgroundColor: '#6366F1',
        backgroundImage: profile.bannerUrl ? `url(${getFileUrl(profile.bannerUrl)})` : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 0
        }
      }}>
        {/* Banner Upload Button */}
        <IconButton
          component="label"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'white'
            },
            zIndex: 10
          }}
        >
          <Camera className="w-5 h-5" />
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => setBanner(e.target.files[0])}
          />
        </IconButton>
        {banner && (
          <Box sx={{ position: 'absolute', top: 16, right: 80, display: 'flex', gap: 1, zIndex: 10 }}>
            <IconButton
              size="small"
              onClick={handleBanner}
              disabled={uploading}
              sx={{ backgroundColor: 'rgba(34, 197, 94, 0.9)', color: 'white', '&:hover': { backgroundColor: 'rgba(34, 197, 94, 1)' } }}
            >
              <Save className="w-4 h-4" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setBanner(null)}
              sx={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 1)' } }}
            >
              <X className="w-4 h-4" />
            </IconButton>
          </Box>
        )}
        <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', zIndex: 1 }}>
          <Box className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
            <Box className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton 
                      className="bg-white shadow-lg p-2"
                      component="label"
                    >
                      <Camera className="w-4 h-4 text-gray-700" />
                      <input 
                        hidden 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={profile.profilePicUrl ? getFileUrl(profile.profilePicUrl) : undefined}
                    sx={{ 
                      width: 128, 
                      height: 128, 
                      border: '4px solid white',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                      backgroundColor: '#6366F1',
                      fontSize: '3rem', 
                      fontWeight: 700 
                    }}
                  >
                    {profile.name?.[0] || 'U'}
                  </Avatar>
                </Badge>
                {file && (
                  <Box className="absolute -bottom-4 left-0 right-0 flex justify-center gap-2">
                    <IconButton 
                      size="small" 
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={handleProfilePic}
                      disabled={uploading}
                    >
                      <Save className="w-4 h-4" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={() => setFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </IconButton>
                  </Box>
                )}
              </motion.div>

              {/* Name and Info */}
              <Box className="flex-1 text-center md:text-left pb-6 bg-white rounded-xl px-6 py-4 shadow-xl">
                <Box className="flex items-center gap-2 mb-1">
                  <Typography 
                    variant="h4" 
                    className="font-bold text-gray-900"
                    sx={{ fontFamily: 'Poppins' }}
                  >
                    {profile.name}
                  </Typography>
                  <IconButton 
                    onClick={handleOpenEditDialog}
                    size="small"
                    sx={{ 
                      ml: 1,
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.2)'
                      }
                    }}
                  >
                    <Edit2 className="w-4 h-4 text-indigo-600" />
                  </IconButton>
                </Box>
                <Box className="flex flex-wrap items-center gap-3 text-gray-600">
                  <Box className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <Typography variant="body2">{profile.email}</Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <Typography variant="body2">Roll: {profile.rollNumber}</Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    <Typography variant="body2">Dept: {profile.department}</Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    <Typography variant="body2">Section: {profile.section}</Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <Typography variant="body2">Year: {profile.year}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" className="mt-32 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Stats Cards */}
          <Grid container spacing={3} className="mb-8">
            {statCards.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    elevation={0}
                    onClick={() => {
                      if (stat.title === "Your Rank") {
                        navigate("/leaderboard");
                      } else if (stat.title === "Achievements") {
                        navigate("/dashboard");
                      }
                    }}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      cursor: stat.title === "Your Rank" || stat.title === "Achievements" ? 'pointer' : 'default',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '8px', backgroundColor: stat.color, mb: 2 }}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {stat.title}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Tabs Section */}
          <Card className="shadow-xl">
            <Tabs 
              value={activeTab} 
              onChange={(e, v) => setActiveTab(v)}
              className="border-b"
            >
              <Tab label="Overview" icon={<User className="w-4 h-4" />} iconPosition="start" />
              <Tab label="Projects" icon={<Briefcase className="w-4 h-4" />} iconPosition="start" />
              <Tab label="Internships" icon={<Book className="w-4 h-4" />} iconPosition="start" />
              <Tab label="Research" icon={<Target className="w-4 h-4" />} iconPosition="start" />
            </Tabs>

            <Box className="p-6">
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  {/* Personal Information */}
                  <Grid item xs={12} md={6}>
                    <Box className="mb-6">
                      <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" /> Personal Information
                      </Typography>
                      <Box className="space-y-3">
                        {[
                          { label: "Full Name", value: profile.name },
                          { label: "Email", value: profile.email },
                          { label: "Roll Number", value: profile.rollNumber },
                          { label: "Section", value: profile.section },
                          { label: "Year", value: profile.year }
                        ].map((item, i) => (
                          <Box key={i} className="flex justify-between py-2 border-b border-gray-100">
                            <Typography variant="body2" className="text-gray-600">{item.label}</Typography>
                            <Typography variant="body2" className="font-medium">{item.value}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Quick Actions */}
                  <Grid item xs={12} md={6}>
                    <Box className="mb-6">
                      <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5" /> Quick Actions
                      </Typography>
                      <Box className="space-y-2">
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate("/update-erp")}
                          className="justify-start normal-case py-3"
                          startIcon={<FileText className="w-5 h-5" />}
                        >
                          Update ERP Profile
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate("/add")}
                          className="justify-start normal-case py-3"
                          startIcon={<Plus className="w-5 h-5" />}
                        >
                          Add Achievement
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate("/dashboard")}
                          className="justify-start normal-case py-3"
                          startIcon={<Trophy className="w-5 h-5" />}
                        >
                          View Achievements
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" className="mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" /> My Projects
                  </Typography>
                  {erpData?.projects && erpData.projects.length > 0 ? (
                    <Grid container spacing={3}>
                      {erpData.projects.map((project, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-200">
                            <Box className="flex items-start justify-between mb-3">
                              <Typography variant="h6" className="font-semibold text-gray-800 flex-1">
                                {project.title || `Project ${index + 1}`}
                              </Typography>
                              {project.certificateUrl && (
                                <Chip label="Certified" size="small" color="success" />
                              )}
                            </Box>
                            
                            {project.description && (
                              <Typography variant="body2" color="text.secondary" className="mb-3 line-clamp-3">
                                {project.description}
                              </Typography>
                            )}
                            
                            {project.link && (
                              <Box className="mb-3">
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  startIcon={<Github className="w-4 h-4" />}
                                  onClick={() => window.open(project.link, '_blank')}
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                >
                                  View on GitHub
                                </Button>
                              </Box>
                            )}
                            
                            <Box className="flex items-center justify-between text-sm text-gray-600">
                              {project.duration && (
                                <Typography variant="caption">
                                  Duration: {project.duration}
                                </Typography>
                              )}
                              {project.role && (
                                <Typography variant="caption">
                                  Role: {project.role}
                                </Typography>
                              )}
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box className="text-center py-12">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <Typography variant="h6" color="text.secondary" className="mb-2">
                        No Projects Added Yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="mb-4">
                        Complete your ERP profile to showcase your projects here
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => navigate('/update-erp')}
                        startIcon={<Plus className="w-4 h-4" />}
                      >
                        Update ERP Profile
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" className="mb-4 flex items-center gap-2">
                    <Book className="w-5 h-5" /> My Internships
                  </Typography>
                  {erpData?.internships && erpData.internships.length > 0 ? (
                    <Grid container spacing={3}>
                      {erpData.internships.map((internship, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-200">
                            <Box className="flex items-start justify-between mb-3">
                              <Typography variant="h6" className="font-semibold text-gray-800 flex-1">
                                {internship.company || `Internship ${index + 1}`}
                              </Typography>
                              {internship.certificateUrl && (
                                <Chip label="Certified" size="small" color="success" />
                              )}
                            </Box>
                            
                            {internship.role && (
                              <Typography variant="subtitle1" color="primary" className="mb-2">
                                {internship.role}
                              </Typography>
                            )}
                            
                            {internship.description && (
                              <Typography variant="body2" color="text.secondary" className="mb-3 line-clamp-3">
                                {internship.description}
                              </Typography>
                            )}
                            
                            <Box className="space-y-2 text-sm text-gray-600">
                              {internship.duration && (
                                <Typography variant="caption" className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Duration: {internship.duration}
                                </Typography>
                              )}
                              {(internship.startDate || internship.endDate) && (
                                <Typography variant="caption" className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> 
                                  {internship.startDate && new Date(internship.startDate).toLocaleDateString()} 
                                  {internship.startDate && internship.endDate && ' - '}
                                  {internship.endDate && new Date(internship.endDate).toLocaleDateString()}
                                </Typography>
                              )}
                              {internship.stipend && (
                                <Typography variant="caption" className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" /> Stipend: {internship.stipend}
                                </Typography>
                              )}
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box className="text-center py-12">
                      <Book className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <Typography variant="h6" color="text.secondary" className="mb-2">
                        No Internships Added Yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="mb-4">
                        Complete your ERP profile to showcase your internships here
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => navigate('/update-erp')}
                        startIcon={<Plus className="w-4 h-4" />}
                      >
                        Update ERP Profile
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" className="mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" /> My Research Works
                  </Typography>
                  {erpData?.researchWorks && erpData.researchWorks.length > 0 ? (
                    <Grid container spacing={3}>
                      {erpData.researchWorks.map((research, index) => (
                        <Grid item xs={12} key={index}>
                          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-200">
                            <Box className="flex items-start justify-between mb-3">
                              <Typography variant="h6" className="font-semibold text-gray-800 flex-1">
                                {research.title || `Research Work ${index + 1}`}
                              </Typography>
                              <Box className="flex gap-1">
                                {research.paperUrl && (
                                  <Chip label="Paper" size="small" color="info" />
                                )}
                                {research.certificateUrl && (
                                  <Chip label="Certificate" size="small" color="success" />
                                )}
                              </Box>
                            </Box>
                            
                            {research.domain && (
                              <Typography variant="subtitle2" color="primary" className="mb-2">
                                Domain: {research.domain}
                              </Typography>
                            )}
                            
                            {research.description && (
                              <Typography variant="body2" color="text.secondary" className="mb-3">
                                {research.description}
                              </Typography>
                            )}
                            
                            <Grid container spacing={2} className="text-sm text-gray-600">
                              {research.guideName && (
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="caption">
                                    <strong>Guide:</strong> {research.guideName}
                                  </Typography>
                                </Grid>
                              )}
                              {research.publicationStatus && (
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="caption">
                                    <strong>Status:</strong> {research.publicationStatus}
                                  </Typography>
                                </Grid>
                              )}
                              {research.journalName && (
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="caption">
                                    <strong>Journal:</strong> {research.journalName}
                                  </Typography>
                                </Grid>
                              )}
                              {research.year && (
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="caption">
                                    <strong>Year:</strong> {research.year}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                            
                            {(research.paperUrl || research.certificateUrl) && (
                              <Box className="flex gap-2 mt-3">
                                {research.paperUrl && (
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    startIcon={<FileText className="w-4 h-4" />}
                                    onClick={() => window.open(getFileUrl(research.paperUrl), '_blank')}
                                  >
                                    View Paper
                                  </Button>
                                )}
                                {research.certificateUrl && (
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    startIcon={<Award className="w-4 h-4" />}
                                    onClick={() => window.open(getFileUrl(research.certificateUrl), '_blank')}
                                  >
                                    View Certificate
                                  </Button>
                                )}
                              </Box>
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box className="text-center py-12">
                      <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <Typography variant="h6" color="text.secondary" className="mb-2">
                        No Research Works Added Yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="mb-4">
                        Complete your ERP profile to showcase your research works here
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => navigate('/update-erp')}
                        startIcon={<Plus className="w-4 h-4" />}
                      >
                        Update ERP Profile
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Card>
        </motion.div>
      </Container>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
        disableEnforceFocus={false}
        aria-labelledby="edit-profile-dialog-title"
        aria-describedby="edit-profile-dialog-description"
      >
        <DialogTitle id="edit-profile-dialog-title">
          <Box className="flex items-center justify-between">
            <Typography variant="h6">Edit Profile</Typography>
            <IconButton onClick={() => setEditDialogOpen(false)}>
              <X className="w-5 h-5" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent id="edit-profile-dialog-description">
          <Box className="space-y-4 mt-4">
            {/* Name Field */}
            <TextField
              fullWidth
              label="Full Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              required
              helperText="Enter your full name (minimum 2 characters)"
            />
            
            {/* Academic Information */}
            <Typography variant="subtitle1" className="font-semibold mt-4">
              Academic Information
            </Typography>
            
            <Box className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                select
                label="Year"
                value={editFormData.year}
                onChange={(e) => setEditFormData({...editFormData, year: e.target.value})}
                required
              >
                <MenuItem value="I">I</MenuItem>
                <MenuItem value="II">II</MenuItem>
                <MenuItem value="III">III</MenuItem>
                <MenuItem value="IV">IV</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                select
                label="Section"
                value={editFormData.section}
                onChange={(e) => setEditFormData({...editFormData, section: e.target.value})}
                required
              >
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'].map(section => (
                  <MenuItem key={section} value={section}>{section}</MenuItem>
                ))}
              </TextField>
            </Box>
            
            {/* Social Links Section */}
            <Typography variant="subtitle1" className="font-semibold mt-4">
              Social Links (Optional)
            </Typography>
            
            <TextField
              fullWidth
              label="GitHub"
              value={editFormData.socialLinks?.github || ""}
              onChange={(e) => setEditFormData({
                ...editFormData, 
                socialLinks: {...editFormData.socialLinks, github: e.target.value}
              })}
              placeholder="https://github.com/username"
            />
            
            <TextField
              fullWidth
              label="LinkedIn"
              value={editFormData.socialLinks?.linkedin || ""}
              onChange={(e) => setEditFormData({
                ...editFormData,
                socialLinks: {...editFormData.socialLinks, linkedin: e.target.value}
              })}
              placeholder="https://linkedin.com/in/username"
            />
            
            <TextField
              fullWidth
              label="LeetCode"
              value={editFormData.socialLinks?.leetcode || ""}
              onChange={(e) => setEditFormData({
                ...editFormData,
                socialLinks: {...editFormData.socialLinks, leetcode: e.target.value}
              })}
              placeholder="https://leetcode.com/username"
            />
            
            <TextField
              fullWidth
              label="CodeChef"
              value={editFormData.socialLinks?.codechef || ""}
              onChange={(e) => setEditFormData({
                ...editFormData,
                socialLinks: {...editFormData.socialLinks, codechef: e.target.value}
              })}
              placeholder="https://www.codechef.com/users/username"
            />
            
            <TextField
              fullWidth
              label="Portfolio Website"
              value={editFormData.socialLinks?.portfolio || ""}
              onChange={(e) => setEditFormData({
                ...editFormData,
                socialLinks: {...editFormData.socialLinks, portfolio: e.target.value}
              })}
              placeholder="https://yourportfolio.com"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained"
            disabled={updatingProfile}
          >
            {updatingProfile ? "Updating..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
