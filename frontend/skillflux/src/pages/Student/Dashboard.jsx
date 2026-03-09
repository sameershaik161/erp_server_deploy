import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Container, Typography, Grid, CircularProgress, Button, Box, Card, Avatar, Chip, IconButton, LinearProgress, Skeleton, Tab, Tabs } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AchievementCard from "../../components/AchievementCard";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Award, Target, Plus, RefreshCw, Calendar, Clock, Star, ChevronRight, Zap, Medal, Activity, CheckCircle, User, FileText, Megaphone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPoints: 0,
    rank: 0,
    percentile: 0,
    totalAchievements: 0,
    pendingCount: 0,
    approvedCount: 0,
    monthlyGrowth: 0
  });

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      console.log("Dashboard: User object full:", user);
      console.log("Dashboard: User year specifically:", user?.year);
      console.log("Dashboard: User department specifically:", user?.department);
      console.log("Dashboard: User keys:", user ? Object.keys(user) : 'no user');
      
      // Must have user year for proper filtering
      if (!user?.year) {
        console.warn("Dashboard: Cannot fetch leaderboard - user year not available");
        setLeaderboard([]);
        return;
      }
      
      // Create query parameters to filter by user's year (REQUIRED)
      const params = {
        year: user.year // Always include year for proper filtering
      };
      console.log("Dashboard: Filtering leaderboard by year:", user.year);
      
      if (user?.department) {
        params.department = user.department;
        console.log("Dashboard: Filtering leaderboard by department:", user.department);
      }
      
      console.log("Dashboard: Leaderboard API params:", params);
      console.log("Dashboard: Making API call to /auth/leaderboard with params:", params);
      
      const res = await axios.get("/auth/leaderboard", { params });
      console.log("Dashboard leaderboard response:", res.data);
      console.log("Dashboard: Total students found:", res.data.length);
      console.log("Dashboard: Sample students received:", res.data.slice(0, 3).map(s => ({
        name: s.name,
        year: s.year,
        section: s.section,
        points: s.totalPoints
      })));
      
      // Verify all students are from the same year
      const uniqueYears = [...new Set(res.data.map(s => s.year))];
      if (uniqueYears.length > 1) {
        console.error("Dashboard: ERROR - Leaderboard contains students from multiple years:", uniqueYears);
      } else {
        console.log("Dashboard: ✅ All students are from year:", uniqueYears[0]);
      }
      
      setLeaderboard(res.data.slice(0, 5)); // Top 5 for dashboard
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      toast.error("Failed to load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const res = await axios.get("/activities/recent");
      setActivities(res.data);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // Get achievements first to calculate actual points
      const achievementsRes = await axios.get("/achievements/me");
      setAchievements(achievementsRes.data);
      
      // Calculate actual total points from approved achievements
      const approved = achievementsRes.data.filter(a => a.status === 'approved');
      const pending = achievementsRes.data.filter(a => a.status === 'pending');
      const calculatedTotalPoints = approved.reduce((sum, a) => sum + (a.points || 0), 0);
      
      console.log("Dashboard: Calculated points from achievements:", calculatedTotalPoints);
      console.log("Dashboard: User totalPoints from context:", user?.totalPoints);
      
      // Get rank with proper year filtering and actual points
      const rankParams = {};
      if (user?.year) {
        rankParams.year = user.year;
        console.log("Dashboard: Fetching rank for year:", user.year);
      }
      if (user?.department) {
        rankParams.department = user.department;
      }
      
      const rankRes = await axios.get("/auth/my-rank", { params: rankParams })
        .catch(err => {
          console.error("Rank fetch failed:", err);
          return { data: { rank: 0 } };
        });
      
      console.log("Dashboard: Rank response:", rankRes.data);
      console.log("Dashboard: Rank value:", rankRes.data.rank);
      console.log("Dashboard: Percentile value:", rankRes.data.percentile);
      console.log("Dashboard: Total Students:", rankRes.data.totalStudents);
      
      console.log("Dashboard: Points comparison:", {
        userTotalPoints: user?.totalPoints || 0,
        calculatedFromAchievements: calculatedTotalPoints,
        difference: (user?.totalPoints || 0) - calculatedTotalPoints
      });
      
      const newStats = {
        totalPoints: user?.totalPoints || 0, // Use user's database totalPoints for consistency
        rank: rankRes.data.rank || 0,
        percentile: rankRes.data.percentile || 0,
        totalAchievements: achievementsRes.data.length,
        pendingCount: pending.length,
        approvedCount: approved.length,
        monthlyGrowth: 12.5 // Mock growth
      };
      
      console.log("Dashboard: Setting stats to:", newStats);
      setStats(newStats);
      
      // Fetch activities after achievements load
      fetchActivities();
      fetchLeaderboard();
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  // Refresh all data including user profile
  const refreshAllData = async () => {
    console.log("Dashboard: Refreshing all data...");
    setStatsLoading(true);
    
    // First refresh user data from server
    if (refreshUser) {
      await refreshUser();
      console.log("Dashboard: User data refreshed");
    }
    
    // Then refresh achievements and stats
    await fetchAchievements();
    console.log("Dashboard: All data refreshed");
  };

  useEffect(() => {
    console.log("Dashboard: useEffect triggered - user:", {
      exists: !!user,
      name: user?.name,
      year: user?.year,
      department: user?.department,
      hasYear: !!user?.year,
      authLoading: authLoading
    });
    
    // Only proceed if user is loaded and auth is not loading
    if (user && !authLoading) {
      console.log("Dashboard: useEffect triggered with user:", { year: user.year, name: user.name });
      fetchAchievements();
    } else if (!user && !authLoading) {
      console.warn("Dashboard: No user data available after auth loading completed");
    }
  }, [user, authLoading]); // Add authLoading dependency

  const getFilteredAchievements = () => {
    if (!achievements) return [];
    switch(tab) {
      case 1: return achievements.filter(a => a.status === 'approved');
      case 2: return achievements.filter(a => a.status === 'pending');
      case 3: return achievements.filter(a => a.status === 'rejected');
      default: return achievements;
    }
  };

  const statCards = [
    { 
      title: "Total Points", 
      value: stats.totalPoints, 
      icon: Trophy, 
      color: "#1E3A8A",
      growth: `+${stats.monthlyGrowth}%`
    },
    { 
      title: "Your Rank", 
      value: `#${stats.rank}`, 
      icon: Medal, 
      color: "#1E3A8A",
      subtitle: stats.percentile > 0 ? `Top ${stats.percentile}%` : ""
    },
    { 
      title: "Achievements", 
      value: stats.totalAchievements, 
      icon: Award, 
      color: "#1E3A8A",
      badge: stats.pendingCount > 0 ? `${stats.pendingCount} pending` : null
    },
    { 
      title: "Success Rate", 
      value: stats.totalAchievements > 0 
        ? `${Math.round((stats.approvedCount / stats.totalAchievements) * 100)}%`
        : "0%", 
      icon: Target, 
      color: "#10B981"
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Container maxWidth="xl" className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <Box className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  color: '#1F2937',
                  mb: 1
                }}
              >
                Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280' }}>
                Here's your achievement overview and recent activity
              </Typography>
            </Box>
            
            <Box className="flex gap-2 mt-4 md:mt-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton 
                  onClick={refreshAllData} 
                  disabled={loading}
                  className="bg-white shadow-lg hover:shadow-xl"
                  title="Refresh all data including points"
                >
                  <RefreshCw className={`w-5 h-5 ${loading || statsLoading ? 'animate-spin' : ''}`} />
                </IconButton>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/add")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
                  startIcon={<Plus className="w-5 h-5" />}
                >
                  Add Achievement
                </Button>
              </motion.div>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} className="mb-8">
            {statCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card 
                    elevation={0}
                    onClick={() => {
                      if (stat.title === "Your Rank") {
                        navigate("/leaderboard");
                      } else if (stat.title === "Achievements") {
                        navigate("/achievements");
                      }
                    }}
                    sx={{
                      p: 3,
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
                    <Box className="flex items-start justify-between mb-4">
                      <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: stat.color }}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </Box>
                      {stat.growth && (
                        <Chip 
                          label={stat.growth}
                          size="small"
                          className="bg-green-100 text-green-700 font-semibold"
                        />
                      )}
                      {stat.badge && (
                        <Chip 
                          label={stat.badge}
                          size="small"
                          className="bg-orange-100 text-orange-700 font-semibold"
                        />
                      )}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5 }}>
                      {statsLoading ? <Skeleton width={80} /> : stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      {stat.title}
                    </Typography>
                    {stat.subtitle && (
                      <Typography variant="caption" className="text-gray-500">
                        {stat.subtitle}
                      </Typography>
                    )}
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Activity Section */}
          <Grid container spacing={3}>
            {/* Recent Achievements */}
            <Grid item xs={12} lg={8}>
              <Card className="p-6 shadow-xl backdrop-blur-xl bg-white/90 border-0">
                <Box className="flex items-center justify-between mb-6">
                  <Box className="flex items-center gap-3">
                    <Box sx={{ p: 1.5, backgroundColor: '#6366F1', borderRadius: '8px' }}>
                      <Trophy className="w-5 h-5 text-white" />
                    </Box>
                    <Typography variant="h6" className="font-semibold">
                      Your Achievements
                    </Typography>
                  </Box>
                  
                  <Tabs 
                    value={tab} 
                    onChange={(e, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label={`All (${achievements?.length || 0})`} />
                    <Tab label={`Approved (${stats.approvedCount})`} />
                    <Tab label={`Pending (${stats.pendingCount})`} />
                    <Tab label="Rejected" />
                  </Tabs>
                </Box>

                {loading ? (
                  <Box className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} variant="rectangular" height={120} className="rounded-xl" />
                    ))}
                  </Box>
                ) : getFilteredAchievements().length > 0 ? (
                  <Box className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {getFilteredAchievements().map((achievement, index) => (
                        <motion.div
                          key={achievement._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-100"
                            onClick={() => navigate("/dashboard")}
                          >
                            <Box className="flex items-start justify-between">
                              <Box className="flex gap-4">
                                <Avatar 
                                  className={`bg-gradient-to-r ${
                                    achievement.status === 'approved' 
                                      ? 'from-green-400 to-emerald-500'
                                      : achievement.status === 'pending'
                                      ? 'from-yellow-400 to-orange-500'
                                      : 'from-red-400 to-pink-500'
                                  }`}
                                >
                                  <Award className="w-5 h-5 text-white" />
                                </Avatar>
                                <Box className="flex-1">
                                  <Typography variant="subtitle1" className="font-semibold text-gray-900">
                                    {achievement.title}
                                  </Typography>
                                  <Typography variant="body2" className="text-gray-600 mb-2">
                                    {achievement.description?.substring(0, 100)}...
                                  </Typography>
                                  <Box className="flex items-center gap-2 flex-wrap">
                                    <Chip 
                                      label={achievement.status}
                                      size="small"
                                      className={`font-semibold ${
                                        achievement.status === 'approved' 
                                          ? 'bg-green-100 text-green-700'
                                          : achievement.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}
                                    />
                                    <Chip 
                                      label={achievement.category}
                                      size="small"
                                      variant="outlined"
                                    />
                                    {achievement.points > 0 && (
                                      <Chip 
                                        label={`${achievement.points} pts`}
                                        size="small"
                                        className="bg-purple-100 text-purple-700"
                                        icon={<Zap className="w-3 h-3" />}
                                      />
                                    )}
                                    <Typography variant="caption" className="text-gray-500">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {new Date(achievement.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <IconButton size="small">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </IconButton>
                            </Box>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </Box>
                ) : (
                  <Box className="text-center py-12">
                    <Box className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                      <Trophy className="w-12 h-12 text-gray-400" />
                    </Box>
                    <Typography variant="h6" className="text-gray-600 mb-2">
                      {tab === 0 ? "No achievements yet" : `No ${['all', 'approved', 'pending', 'rejected'][tab]} achievements`}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mb-4">
                      {tab === 0 ? "Start by adding your first achievement!" : "Check other tabs for more achievements"}
                    </Typography>
                    {tab === 0 && (
                      <Button
                        variant="contained"
                        onClick={() => navigate("/add")}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        startIcon={<Plus className="w-4 h-4" />}
                      >
                        Add Your First Achievement
                      </Button>
                    )}
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Leaderboard & Activity Feed */}
            <Grid item xs={12} lg={4}>
              <Box className="space-y-4">
                {/* Leaderboard */}
                <Card className="p-6 shadow-xl backdrop-blur-xl bg-white/90 border-0">
                  <Box className="flex items-center justify-between mb-4">
                    <Box className="flex items-center gap-3">
                      <Box className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                        <Trophy className="w-5 h-5 text-white" />
                      </Box>
                      <Box>
                        <Typography variant="h6" className="font-semibold">
                          Top Students
                        </Typography>
                        {user?.year && (
                          <Typography variant="caption" className="text-gray-500">
                            {user.year} Year • {user.department || 'All Departments'}
                          </Typography>
                        )}                      {!user?.year && (
                        <Box>
                          <Typography variant="caption" className="text-red-500 block mb-2">
                            Year: Not Available (Debug: {JSON.stringify({hasUser: !!user, userKeys: user ? Object.keys(user) : 'none'})})
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={async () => {
                              try {
                                await refreshUser();
                                toast.success("User data refreshed");
                              } catch (err) {
                                toast.error("Failed to refresh user data");
                              }
                            }}
                            className="text-xs"
                          >
                            Refresh User Data
                          </Button>
                        </Box>
                      )}                      </Box>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => navigate("/leaderboard")}
                      className="text-xs"
                    >
                      View All
                    </Button>
                  </Box>
                  <Box className="space-y-3">
                    {leaderboardLoading ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <Box key={i} className="flex items-center gap-3">
                          <Skeleton variant="circular" width={32} height={32} />
                          <Box className="flex-1">
                            <Skeleton width="60%" />
                            <Skeleton width="40%" />
                          </Box>
                          <Skeleton width="30px" />
                        </Box>
                      ))
                    ) : leaderboard.length > 0 ? (
                      leaderboard.map((student, index) => (
                        <Box key={student._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <Box className="relative">
                            <Avatar 
                              src={student.profilePicUrl ? `/uploads/${student.profilePicUrl.replace('/uploads/', '')}` : undefined}
                              sx={{ width: 32, height: 32 }}
                            >
                              {student.name?.[0]}
                            </Avatar>
                            <Box 
                              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                              }`}
                            >
                              {index + 1}
                            </Box>
                          </Box>
                          <Box className="flex-1 min-w-0">
                            <Typography variant="body2" className="font-medium text-gray-900 truncate">
                              {student.name}
                              {student._id === user?.id && (
                                <Chip 
                                  label="You" 
                                  size="small" 
                                  sx={{ ml: 1, height: 16, fontSize: '0.6rem', bgcolor: '#3B82F6', color: 'white' }}
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {student.year} Year • {student.section}
                            </Typography>
                          </Box>
                          <Box className="text-right">
                            <Typography variant="body2" className="font-semibold text-blue-600">
                              {student.totalPoints || 0}
                            </Typography>
                            <Typography variant="caption" className="text-gray-400">
                              pts
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box className="text-center py-4">
                        <Typography variant="body2" className="text-gray-500">
                          {!user?.year 
                            ? "Unable to load leaderboard - year information not available" 
                            : "No leaderboard data available for your year"
                          }
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6 shadow-xl backdrop-blur-xl bg-white/90 border-0">
                  <Box className="flex items-center justify-between mb-4">
                    <Box className="flex items-center gap-3">
                      <Box className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                      </Box>
                      <Typography variant="h6" className="font-semibold">
                        Recent Activity
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={fetchActivities}
                      disabled={activitiesLoading}
                    >
                      <RefreshCw className={`w-4 h-4 ${activitiesLoading ? 'animate-spin' : ''}`} />
                    </IconButton>
                  </Box>
                  <Box className="space-y-3">
                    {activitiesLoading ? (
                      [1, 2, 3].map(i => (
                        <Box key={i} className="flex items-start gap-3">
                          <Skeleton variant="circular" width={20} height={20} />
                          <Box className="flex-1">
                            <Skeleton width="80%" />
                            <Skeleton width="40%" />
                          </Box>
                        </Box>
                      ))
                    ) : activities.length > 0 ? (
                      activities.map((activity, index) => {
                        const IconComponent = activity.icon === 'CheckCircle' ? CheckCircle
                          : activity.icon === 'TrendingUp' ? TrendingUp
                          : activity.icon === 'Clock' ? Clock
                          : activity.icon === 'User' ? User
                          : Activity;
                        
                        const colorClass = activity.color === 'green' ? 'text-green-600'
                          : activity.color === 'blue' ? 'text-blue-600'
                          : activity.color === 'orange' ? 'text-orange-600'
                          : activity.color === 'red' ? 'text-red-600'
                          : 'text-gray-600';
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Box className="flex items-start gap-3">
                              <IconComponent className={`w-5 h-5 mt-0.5 ${colorClass}`} />
                              <Box className="flex-1">
                                <Typography variant="body2" className="text-gray-700">
                                  {activity.text}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                  {activity.relativeTime}
                                </Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        );
                      })
                    ) : (
                      <Box className="text-center py-4">
                        <Typography variant="body2" className="text-gray-500">
                          No recent activity
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
