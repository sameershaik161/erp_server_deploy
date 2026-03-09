import { useState, useEffect } from "react";
import { Container, Typography, Grid, Paper, Card, Box, Button, Avatar, Chip, IconButton, LinearProgress, Skeleton, Badge, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { 
  Trophy, Users, TrendingUp, Award, FileText, BarChart3, 
  Shield, Activity, Clock, CheckCircle, AlertCircle, XCircle,
  Calendar, Bell, Settings, ChevronRight, Briefcase, Megaphone,
  DollarSign, UserCheck, Star, Zap, ArrowUpRight, ArrowDownRight
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAchievements: 0,
    pendingApprovals: 0,
    totalPoints: 0,
    approvalRate: 0,
    monthlyGrowth: 0,
    pendingERPs: 0,
    activeAnnouncements: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const [dashboardRes, analyticsRes] = await Promise.all([
        axios.get("/admin/dashboard-stats"),
        axios.get("/admin/analytics")
      ]);
      
      // Set real stats from API
      if (dashboardRes.data.stats) {
        setStats(dashboardRes.data.stats);
      }
      
      // Set top students
      setTopStudents(analyticsRes.data.topStudents?.slice(0, 5) || []);
      
      // Set real recent activities
      if (dashboardRes.data.recentActivities && dashboardRes.data.recentActivities.length > 0) {
        // Map activities with appropriate icons
        const mappedActivities = dashboardRes.data.recentActivities.slice(0, 5).map(activity => ({
          text: activity.text,
          time: activity.time,
          type: activity.type,
          icon: activity.type === "success" ? CheckCircle :
                activity.type === "error" ? XCircle :
                activity.type === "warning" ? AlertCircle :
                activity.type === "announcement" ? Megaphone :
                Trophy
        }));
        setRecentActivities(mappedActivities);
      } else {
        // Fallback activities if no data
        setRecentActivities([
          { text: "No recent activities", time: "now", type: "info", icon: AlertCircle }
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      toast.error("Failed to load dashboard data");
      // Use default values on error
      setStats({
        totalStudents: 0,
        totalAchievements: 0,
        pendingApprovals: 0,
        totalPoints: 0,
        approvalRate: 0,
        monthlyGrowth: 0,
        pendingERPs: 0,
        activeAnnouncements: 0
      });
      setRecentActivities([]);
      setTopStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "bg-blue-900",
      bgColor: "bg-white",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Total Achievements",
      value: stats.totalAchievements,
      icon: Trophy,
      color: "bg-blue-900",
      bgColor: "bg-white",
      change: "+23%",
      trend: "up"
    },
    {
      title: "Pending Approvals",
      value: (stats.pendingApprovals || 0) + (stats.pendingERPs || 0),
      icon: Clock,
      color: "bg-blue-900",
      bgColor: "bg-white",
      badge: "Urgent",
      trend: "neutral",
      subtitle: `${stats.pendingApprovals || 0} Achievements, ${stats.pendingERPs || 0} ERPs`
    },
    {
      title: "Total Points",
      value: stats.totalPoints.toLocaleString(),
      icon: Star,
      color: "bg-blue-900",
      bgColor: "bg-white",
      change: "+18%",
      trend: "up"
    }
  ];

  const quickActions = [
    { label: "Manage Achievements", icon: Trophy, to: "/admin/manage", color: "bg-blue-900", count: stats.pendingApprovals },
    { label: "Manage ERPs", icon: FileText, to: "/admin/manage-erp", color: "bg-blue-900", count: stats.pendingERPs },
    { label: "Announcements", icon: Megaphone, to: "/admin/announcements", color: "bg-blue-900", count: stats.activeAnnouncements },
    { label: "View Analytics", icon: BarChart3, to: "/admin/analytics", color: "bg-blue-900" }
  ];

  return (
    <Box className="min-h-screen" sx={{ backgroundColor: '#F9FAFB' }}>
      <Container maxWidth="xl" className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
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
                Admin Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280' }}>
                Monitor and manage the Student ERP Portal
              </Typography>
            </Box>
            
            <Box className="flex gap-2 mt-4 md:mt-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton className="bg-white shadow-lg hover:shadow-xl">
                  <Bell className="w-5 h-5" />
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton className="bg-white shadow-lg hover:shadow-xl">
                  <Settings className="w-5 h-5" />
                </IconButton>
              </motion.div>
            </Box>
          </Box>

          {/* KPI Cards */}
          <Grid container spacing={3} className="mb-8">
            {statCards.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card 
                    elevation={0}
                    onClick={() => {
                      if (stat.title === "Total Students") {
                        navigate('/admin/students');
                      } else if (stat.title === "Total Achievements") {
                        navigate('/admin/students', { state: { filterType: 'withAchievements' } });
                      } else if (stat.title === "Pending Approvals") {
                        setPendingDialogOpen(true);
                      }
                    }}
                    sx={{
                      p: 3,
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      cursor: ['Total Students', 'Total Achievements', 'Pending Approvals'].includes(stat.title) ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  >
                    <Box className="flex items-start justify-between mb-4">
                      <Box className={`p-3 rounded-lg ${stat.color}`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </Box>
                      {stat.badge && (
                        <Chip 
                          label={stat.badge}
                          size="small"
                          className="bg-red-100 text-red-700 font-semibold animate-pulse"
                        />
                      )}
                      {stat.change && (
                        <Box className="flex items-center gap-1">
                          {stat.trend === "up" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                          <Typography 
                            variant="caption" 
                            className={stat.trend === "up" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
                          >
                            {stat.change}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="h4" className="font-bold text-gray-900 mb-1">
                      {loading ? <Skeleton width={100} /> : stat.value}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {stat.title}
                    </Typography>
                    {stat.subtitle && (
                      <Typography variant="caption" className="text-gray-500 block mt-1">
                        {stat.subtitle}
                      </Typography>
                    )}
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Main Content Grid */}
          <Grid container spacing={3}>
            {/* Quick Actions */}
            <Grid item xs={12} lg={8}>
              <Card className="p-6 shadow-lg bg-white border border-gray-200 h-full">
                <Box className="flex items-center gap-3 mb-6">
                  <Box className="p-2 bg-blue-900 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </Box>
                  <Typography variant="h6" className="font-semibold">
                    Quick Actions
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          elevation={0}
                          onClick={() => {
                            if (action.label === "Manage Achievements") {
                              navigate(action.to, { state: { filterStatus: 'pending' } });
                            } else if (action.label === "Manage ERPs") {
                              navigate(action.to, { state: { filterStatus: 'submitted' } });
                            } else {
                              navigate(action.to);
                            }
                          }}
                          sx={{
                            p: 2.5,
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '10px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                              borderColor: '#6366F1'
                            }
                          }}
                        >
                          <Box className="flex items-center justify-between">
                            <Box className="flex items-center gap-3">
                              <Box className={`p-3 ${action.color} rounded-lg`}>
                                <action.icon className="w-5 h-5 text-white" />
                              </Box>
                              <Box>
                                <Typography variant="subtitle1" className="font-semibold text-gray-900">
                                  {action.label}
                                </Typography>
                                {action.count !== undefined && (
                                  <Typography variant="caption" className="text-gray-500">
                                    {action.count} items need attention
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            {action.count !== undefined && action.count > 0 && (
                              <Badge badgeContent={action.count} color="error" />
                            )}
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </Box>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} lg={4}>
              <Card className="p-6 shadow-lg bg-white border border-gray-200 h-full">
                <Box className="flex items-center gap-3 mb-6">
                  <Box className="p-2 bg-blue-900 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </Box>
                  <Typography variant="h6" className="font-semibold">
                    Recent Activity
                  </Typography>
                </Box>
                
                <Box className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Box className="flex items-start gap-3">
                        <Box className={`p-2 rounded-lg ${
                          activity.type === 'success' ? 'bg-green-100' :
                          activity.type === 'warning' ? 'bg-yellow-100' :
                          activity.type === 'announcement' ? 'bg-purple-100' :
                          'bg-blue-100'
                        }`}>
                          <activity.icon className={`w-4 h-4 ${
                            activity.type === 'success' ? 'text-green-600' :
                            activity.type === 'warning' ? 'text-yellow-600' :
                            activity.type === 'announcement' ? 'text-purple-600' :
                            'text-blue-600'
                          }`} />
                        </Box>
                        <Box className="flex-1">
                          <Typography variant="body2" className="text-gray-700">
                            {activity.text}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
                
                <Button 
                  fullWidth 
                  variant="text" 
                  className="mt-4 normal-case"
                  endIcon={<ChevronRight className="w-4 h-4" />}
                >
                  View All Activity
                </Button>
              </Card>
            </Grid>

            {/* Top Students */}
            <Grid item xs={12}>
              <Card className="p-6 shadow-lg bg-white border border-gray-200">
                <Box className="flex items-center justify-between mb-6">
                  <Box className="flex items-center gap-3">
                    <Box className="p-2 bg-blue-900 rounded-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </Box>
                    <Typography variant="h6" className="font-semibold">
                      Top Performing Students
                    </Typography>
                  </Box>
                  <Button 
                    variant="text" 
                    onClick={() => navigate("/admin/analytics")}
                    endIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    View All
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  {loading ? (
                    [1,2,3,4,5].map(i => (
                      <Grid item xs={12} sm={6} md={2.4} key={i}>
                        <Skeleton variant="rectangular" height={150} className="rounded-xl" />
                      </Grid>
                    ))
                  ) : topStudents.length > 0 ? (
                    topStudents.map((student, index) => (
                      <Grid item xs={12} sm={6} md={2.4} key={index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -5 }}
                        >
                          <Card className="p-4 text-center hover:shadow-lg transition-all border border-gray-100">
                            <Box className="relative inline-block mb-3">
                              <Avatar 
                                className="w-16 h-16 mx-auto bg-blue-900"
                                sx={{ fontSize: '1.5rem', fontWeight: 700 }}
                              >
                                {student.name?.[0] || 'S'}
                              </Avatar>
                              {index < 3 && (
                                <Box className="absolute -top-1 -right-1">
                                  <Box className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                    index === 0 ? 'bg-yellow-500' :
                                    index === 1 ? 'bg-gray-400' :
                                    'bg-orange-600'
                                  }`}>
                                    {index + 1}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                            <Typography variant="subtitle2" className="font-semibold text-gray-900 truncate">
                              {student.name || 'Student'}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500 block">
                              {student.rollNumber}
                            </Typography>
                            <Chip 
                              label={`${student.totalPoints} pts`}
                              size="small"
                              className="mt-2 bg-blue-100 text-blue-900 font-semibold"
                              icon={<Star className="w-3 h-3" />}
                            />
                          </Card>
                        </motion.div>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" className="text-center text-gray-500">
                        No student data available
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Card>
            </Grid>
          </Grid>

          {/* Pending Approvals Dialog */}
          <Dialog 
            open={pendingDialogOpen} 
            onClose={() => setPendingDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ 
              backgroundColor: '#6366F1', 
              color: 'white',
              fontWeight: 600
            }}>
              Pending Approvals
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <List>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => {
                      setPendingDialogOpen(false);
                      navigate('/admin/manage', { state: { filterStatus: 'pending' } });
                    }}
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        backgroundColor: '#F9FAFB'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Box sx={{ 
                        p: 1.5, 
                        backgroundColor: '#EEF2FF', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Trophy className="w-5 h-5" style={{ color: '#6366F1' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Pending Achievements
                          </Typography>
                          {stats.pendingApprovals > 0 && (
                            <Chip 
                              label={stats.pendingApprovals}
                              size="small"
                              sx={{
                                backgroundColor: '#EF4444',
                                color: 'white',
                                fontWeight: 600,
                                minWidth: '24px',
                                height: '24px'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={`${stats.pendingApprovals || 0} achievement${stats.pendingApprovals !== 1 ? 's' : ''} awaiting review`}
                    />
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => {
                      setPendingDialogOpen(false);
                      navigate('/admin/manage-erp', { state: { filterStatus: 'submitted' } });
                    }}
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        backgroundColor: '#F9FAFB'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Box sx={{ 
                        p: 1.5, 
                        backgroundColor: '#DBEAFE', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FileText className="w-5 h-5" style={{ color: '#3B82F6' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Pending ERPs
                          </Typography>
                          {stats.pendingERPs > 0 && (
                            <Chip 
                              label={stats.pendingERPs}
                              size="small"
                              sx={{
                                backgroundColor: '#F59E0B',
                                color: 'white',
                                fontWeight: 600,
                                minWidth: '24px',
                                height: '24px'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={`${stats.pendingERPs || 0} ERP${stats.pendingERPs !== 1 ? 's' : ''} awaiting verification`}
                    />
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </ListItemButton>
                </ListItem>
              </List>
            </DialogContent>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}
