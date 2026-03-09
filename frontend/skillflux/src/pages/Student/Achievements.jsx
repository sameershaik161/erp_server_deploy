import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Container, Typography, Box, Card, Avatar, Chip, CircularProgress, Grid, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Award, Calendar, ArrowLeft, Star, Medal, Users, Eye, Trash2, X, Plus, BookOpen, Music, Dumbbell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getFileUrl } from "../../config/api";

export default function Achievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    { value: 'all', label: 'All Achievements', icon: Trophy, color: '#6366F1' },
    { 
      value: 'Technical', 
      label: 'Technical', 
      icon: Star, 
      color: '#F59E0B',
      subCategories: [
        { value: 'Competition', label: 'Competitions', icon: Medal },
        { value: 'Certification', label: 'Certifications', icon: Award }
      ]
    },
    { 
      value: 'Non-technical', 
      label: 'Non-technical', 
      icon: Users, 
      color: '#10B981',
      subCategories: [
        { value: 'Co-curricular', label: 'Co-curricular', icon: BookOpen },
        { value: 'Extra-curricular', label: 'Extra-curricular', icon: Music }
      ]
    }
  ];

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/achievements/me");
      setAchievements(res.data);
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const deleteAchievement = async (achievementId) => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) return;
    
    try {
      setDeleting(true);
      await axios.delete(`/achievements/${achievementId}`);
      toast.success("Achievement deleted successfully");
      setDetailsOpen(false);
      fetchAchievements();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete achievement");
    } finally {
      setDeleting(false);
    }
  };

  const openDetails = (achievement) => {
    setSelectedAchievement(achievement);
    setDetailsOpen(true);
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const getFilteredAchievements = () => {
    let filtered = achievements;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (selectedSubCategory) {
      if (selectedCategory === 'Technical') {
        filtered = filtered.filter(a => a.achievementType === selectedSubCategory);
      } else if (selectedCategory === 'Non-technical') {
        filtered = filtered.filter(a => a.subCategory === selectedSubCategory);
      }
    }
    
    return filtered;
  };

  const getCategoryStats = (category) => {
    if (category === 'all') return achievements.length;
    return achievements.filter(a => a.category === category).length;
  };

  const getSubCategoryStats = (mainCategory, subCategory) => {
    const mainFiltered = achievements.filter(a => a.category === mainCategory);
    if (mainCategory === 'Technical') {
      return mainFiltered.filter(a => a.achievementType === subCategory).length;
    } else if (mainCategory === 'Non-technical') {
      return mainFiltered.filter(a => a.subCategory === subCategory).length;
    }
    return 0;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
    }
  };

  const filteredAchievements = getFilteredAchievements();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Container maxWidth="xl" className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box className="mb-8">
            <Box className="flex items-center gap-4 mb-4">
              <IconButton 
                onClick={() => navigate('/dashboard')}
                className="bg-white shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </IconButton>
              <Box className="flex-1">
                <Typography 
                  variant="h3" 
                  className="font-bold text-gray-900 mb-2"
                >
                  My Achievements
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Track and manage all your accomplishments
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus className="w-5 h-5" />}
                onClick={() => navigate('/add-achievement')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(102, 126, 234, 0.6)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Add Achievement
              </Button>
            </Box>
          </Box>

          {/* Category Cards */}
          <Grid container spacing={3} className="mb-8">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              const count = getCategoryStats(category.value);
              const isSelected = selectedCategory === category.value;
              
              return (
                <Grid item xs={12} md={4} key={category.value}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setSelectedSubCategory(null);
                      }}
                      sx={{
                        p: 4,
                        cursor: 'pointer',
                        borderRadius: '20px',
                        background: isSelected 
                          ? `linear-gradient(135deg, ${category.color}dd 0%, ${category.color}bb 100%)`
                          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: `2px solid ${isSelected ? category.color : 'transparent'}`,
                        boxShadow: isSelected 
                          ? `0 20px 40px ${category.color}40` 
                          : '0 4px 20px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                          transform: 'translateY(-6px)'
                        }
                      }}
                    >
                      <Box className="text-center">
                        <Box 
                          sx={{ 
                            display: 'inline-flex',
                            p: 2, 
                            borderRadius: '16px', 
                            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : category.color,
                            mb: 3
                          }}
                        >
                          <CategoryIcon className={`w-8 h-8 text-white`} />
                        </Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 800, 
                            color: isSelected ? 'white' : '#1F2937',
                            mb: 1
                          }}
                        >
                          {count}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: isSelected ? 'rgba(255, 255, 255, 0.95)' : '#4B5563',
                            fontWeight: isSelected ? 700 : 600
                          }}
                        >
                          {category.label}
                        </Typography>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* Sub-Category Cards */}
          {selectedCategory !== 'all' && categories.find(c => c.value === selectedCategory)?.subCategories && (
            <Box className="mb-8">
              <Typography variant="h6" className="mb-4 font-semibold text-gray-700">
                {categories.find(c => c.value === selectedCategory)?.label} Sub-Categories
              </Typography>
              <Grid container spacing={2}>
                {categories.find(c => c.value === selectedCategory)?.subCategories.map((subCat) => {
                  const SubIcon = subCat.icon;
                  const count = getSubCategoryStats(selectedCategory, subCat.value);
                  const isSelected = selectedSubCategory === subCat.value;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={subCat.value}>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card
                          onClick={() => setSelectedSubCategory(isSelected ? null : subCat.value)}
                          sx={{
                            p: 3,
                            cursor: 'pointer',
                            borderRadius: '16px',
                            background: isSelected ? '#6366F1' : 'white',
                            border: `2px solid ${isSelected ? '#6366F1' : '#E5E7EB'}`,
                            boxShadow: isSelected ? '0 8px 25px rgba(99, 102, 241, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Box className="flex items-center gap-3">
                            <Avatar 
                              sx={{ 
                                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#F3F4F6',
                                color: isSelected ? 'white' : '#6B7280',
                                width: 40, 
                                height: 40
                              }}
                            >
                              <SubIcon className="w-5 h-5" />
                            </Avatar>
                            <Box className="flex-1">
                              <Typography 
                                variant="subtitle1" 
                                className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}
                              >
                                {subCat.label}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                className={isSelected ? 'text-blue-100' : 'text-gray-500'}
                              >
                                {count} achievements
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Achievements List */}
          <Box>
            <Box className="flex items-center justify-between mb-6">
              <Typography variant="h5" className="font-bold text-gray-900">
                {selectedCategory === 'all' 
                  ? 'All Achievements' 
                  : selectedSubCategory 
                    ? `${selectedSubCategory} Achievements`
                    : `${selectedCategory} Achievements`
                } ({filteredAchievements.length})
              </Typography>
            </Box>

            {filteredAchievements.length === 0 ? (
              <Card sx={{ p: 6, borderRadius: '16px', textAlign: 'center' }}>
                <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <Typography variant="h6" className="text-gray-600 mb-2">
                  No achievements found
                </Typography>
                <Typography variant="body2" className="text-gray-500 mb-4">
                  {selectedCategory === 'all' 
                    ? "You haven't added any achievements yet." 
                    : `No ${selectedCategory.toLowerCase()} achievements found.`}
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/add-achievement')}
                  startIcon={<Plus className="w-4 h-4" />}
                >
                  Add Your First Achievement
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {filteredAchievements.map((achievement, index) => (
                  <Grid item xs={12} md={6} lg={4} key={achievement._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card
                        sx={{
                          borderRadius: '20px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                            transform: 'translateY(-5px)'
                          }
                        }}
                      >
                        <Box sx={{ p: 3 }}>
                          <Box className="flex items-start justify-between mb-3">
                            <Avatar 
                              className={`${
                                achievement.status === 'approved' 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                  : achievement.status === 'pending'
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                  : 'bg-gradient-to-r from-red-400 to-pink-500'
                              }`}
                              sx={{ width: 48, height: 48 }}
                            >
                              <Award className="w-6 h-6 text-white" />
                            </Avatar>
                            <Box className="flex gap-1">
                              <Chip 
                                label={achievement.status}
                                size="small"
                                className={`${getStatusColor(achievement.status).bg} ${getStatusColor(achievement.status).text} font-semibold capitalize`}
                              />
                            </Box>
                          </Box>
                          
                          <Typography variant="h6" className="font-bold text-gray-900 mb-2 line-clamp-2">
                            {achievement.title}
                          </Typography>
                          
                          <Typography variant="body2" className="text-gray-600 mb-3 line-clamp-3">
                            {achievement.description || "No description provided"}
                          </Typography>
                          
                          <Box className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <Typography variant="body2" className="text-gray-600">
                              {achievement.dateOfIssue ? 
                                new Date(achievement.dateOfIssue).toLocaleDateString() : 
                                'Date not specified'
                              }
                            </Typography>
                          </Box>
                          
                          <Box className="flex items-center justify-between">
                            <Box className="flex items-center gap-2">
                              <Chip 
                                label={achievement.category}
                                size="small"
                                variant="outlined"
                                className="text-blue-600 border-blue-200"
                              />
                              {achievement.status === 'approved' && achievement.points > 0 && (
                                <Chip 
                                  label={`${achievement.points} pts`}
                                  size="small"
                                  className="bg-purple-100 text-purple-700"
                                />
                              )}
                            </Box>
                            <IconButton 
                              onClick={() => openDetails(achievement)}
                              size="small"
                              className="text-gray-600 hover:text-blue-600"
                            >
                              <Eye className="w-4 h-4" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Achievement Details Modal */}
          <Dialog 
            open={detailsOpen} 
            onClose={() => setDetailsOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { borderRadius: '16px', maxHeight: '90vh' }
            }}
          >
            <DialogTitle sx={{ pb: 2 }}>
              <Box className="flex items-center justify-between">
                <Typography variant="h5" className="font-bold">
                  Achievement Details
                </Typography>
                <IconButton onClick={() => setDetailsOpen(false)}>
                  <X className="w-5 h-5" />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent dividers>
              {selectedAchievement ? (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box className="flex items-center gap-3 mb-4">
                      <Avatar 
                        className={`${
                          selectedAchievement.status === 'approved' 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : selectedAchievement.status === 'pending'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                            : 'bg-gradient-to-r from-red-400 to-pink-500'
                        }`}
                        sx={{ width: 56, height: 56 }}
                      >
                        <Award className="w-8 h-8 text-white" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" className="font-bold text-gray-900">
                          {selectedAchievement.title}
                        </Typography>
                        <Box className="flex gap-2 mt-1">
                          <Chip 
                            label={selectedAchievement.status}
                            size="small"
                            className={`${getStatusColor(selectedAchievement.status).bg} ${getStatusColor(selectedAchievement.status).text} font-semibold capitalize`}
                          />
                          <Chip 
                            label={selectedAchievement.achievementType}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" className="mb-2 font-semibold text-gray-800">
                      Description
                    </Typography>
                    <Typography variant="body1" className="text-gray-600 mb-4">
                      {selectedAchievement.description || "No description provided"}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" className="mb-1 font-semibold text-gray-700">
                      Category
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {selectedAchievement.category}
                      {selectedAchievement.subCategory && ` • ${selectedAchievement.subCategory}`}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" className="mb-1 font-semibold text-gray-700">
                      Level
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {selectedAchievement.level}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" className="mb-1 font-semibold text-gray-700">
                      Date of Issue
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {selectedAchievement.dateOfIssue ? 
                        new Date(selectedAchievement.dateOfIssue).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not specified'
                      }
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" className="mb-1 font-semibold text-gray-700">
                      Organized Institute
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {selectedAchievement.organizedInstitute || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  {selectedAchievement.award && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" className="mb-1 font-semibold text-gray-700">
                        Award
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {selectedAchievement.award === '1' ? '1st Place' : 
                         selectedAchievement.award === '2' ? '2nd Place' : 
                         selectedAchievement.award === '3' ? '3rd Place' : 
                         selectedAchievement.award === 'runner' ? 'Runner Up' : 
                         'Participation'}
                      </Typography>
                    </Grid>
                  )}
                  
                  {selectedAchievement.points > 0 && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" className="mb-1 font-semibold text-gray-700">
                        Points Awarded
                      </Typography>
                      <Typography variant="body2" className="text-purple-600 font-semibold">
                        {selectedAchievement.points} points
                      </Typography>
                    </Grid>
                  )}
                  
                  {selectedAchievement.proofFiles?.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" className="mb-2 font-semibold text-gray-700">
                        Proof Documents
                      </Typography>
                      <Box className="flex flex-wrap gap-2">
                        {selectedAchievement.proofFiles.map((file, index) => (
                          <Button
                            key={index}
                            variant="outlined"
                            size="small"
                            startIcon={<Eye className="w-4 h-4" />}
                            href={getFileUrl(file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            Document {index + 1}
                          </Button>
                        ))}
                      </Box>
                    </Grid>
                  )}
                  
                  {selectedAchievement.adminNote && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" className="mb-1 font-semibold text-gray-700">
                        Admin Note
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 p-2 bg-gray-50 rounded">
                        {selectedAchievement.adminNote}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Box className="text-center py-8">
                  <CircularProgress />
                  <Typography variant="body2" className="mt-2 text-gray-500">
                    Loading achievement details...
                  </Typography>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setDetailsOpen(false)}
                variant="outlined"
              >
                Close
              </Button>
              {selectedAchievement && (
                <Button 
                  onClick={() => deleteAchievement(selectedAchievement._id)}
                  variant="contained"
                  color="error"
                  startIcon={<Trash2 className="w-4 h-4" />}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Achievement'}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}
