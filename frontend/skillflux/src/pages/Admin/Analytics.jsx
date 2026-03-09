import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Box, Grid, Card, CardContent, Avatar, Chip } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, CheckCircle, Users, Award, FileText } from "lucide-react";

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/admin/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <Container sx={{ mt: 4, textAlign: "center" }}>
      <CircularProgress />
    </Container>
  );

  if (!data) return (
    <Container sx={{ mt: 4 }}>
      <Typography>Failed to load analytics</Typography>
    </Container>
  );

  const approvedCount = data.achievements?.approvedCount || 0;
  const totalStudents = data.totalStudents || 0;
  const totalSubmittedErps = data.erpCgpa?.totalSubmitted || 0;
  const approvedByCategory = data.achievements?.byCategory || [];
  const approvedByType = data.achievements?.byType || [];
  const approvedByLevel = data.achievements?.byLevel || [];
  const approvedByStudentYear = data.achievements?.byStudentYear || [];
  const erpYearWise = data.erpCgpa?.yearWise || [];

  const statCards = [
    {
      title: "Approved Achievements",
      count: approvedCount,
      icon: CheckCircle,
      bgGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      onClick: () => navigate(`/admin/manage?status=approved`)
    },
    {
      title: "Total Students",
      count: totalStudents,
      icon: Users,
      bgGradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
      onClick: null
    },
    {
      title: "Submitted ERPs",
      count: totalSubmittedErps,
      icon: FileText,
      bgGradient: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      onClick: () => navigate(`/admin/manage-erp`)
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1F2937',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ p: 2, bgcolor: '#6366F1', borderRadius: 2 }}>
                <TrendingUp className="w-8 h-8 text-white" />
              </Box>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track approved achievements and CGPA analytics from student-submitted ERPs
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} lg={12}>
            <Grid container spacing={3}>
              {statCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card
                      onClick={card.onClick || undefined}
                      sx={{
                        cursor: card.onClick ? 'pointer' : 'default',
                        background: card.bgGradient,
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: card.onClick ? '0 15px 40px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                              {card.title}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                              {card.count}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              borderRadius: 2,
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            <card.icon className="w-8 h-8" />
                          </Box>
                        </Box>
                        {card.onClick && (
                          <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                            Click to view details
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Approved Achievements Breakdown */}
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Trophy className="w-5 h-5" />
                Approved Achievements by Category
              </Typography>
              {approvedByCategory.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Category</strong></TableCell>
                      <TableCell align="right"><strong>Count</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {approvedByCategory.map((row) => (
                      <TableRow key={row.category}>
                        <TableCell>{row.category}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">No approved achievements yet</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircle className="w-5 h-5" />
                Approved Achievements by Student Year
              </Typography>
              {approvedByStudentYear.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Year</strong></TableCell>
                      <TableCell align="right"><strong>Count</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {approvedByStudentYear.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">No approved achievements yet</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Approved Achievements by Type
              </Typography>
              {approvedByType.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell align="right"><strong>Count</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {approvedByType.map((row) => (
                      <TableRow key={row.achievementType}>
                        <TableCell>{row.achievementType}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">No approved achievements yet</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Approved Achievements by Level
              </Typography>
              {approvedByLevel.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Level</strong></TableCell>
                      <TableCell align="right"><strong>Count</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {approvedByLevel.map((row) => (
                      <TableRow key={row.level}>
                        <TableCell>{row.level}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">No approved achievements yet</Typography>
              )}
            </Paper>
          </Grid>

          {/* ERP CGPA Analytics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TrendingUp className="w-5 h-5" />
                ERP CGPA Analytics (Year-wise)
              </Typography>
              {erpYearWise.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Current Year</strong></TableCell>
                      <TableCell align="right"><strong>ERPs</strong></TableCell>
                      <TableCell align="right"><strong>Avg CGPA</strong></TableCell>
                      <TableCell align="right"><strong>Min CGPA</strong></TableCell>
                      <TableCell align="right"><strong>Max CGPA</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {erpYearWise.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                        <TableCell align="right">{row.avgCGPA ?? "-"}</TableCell>
                        <TableCell align="right">{row.minCGPA ?? "-"}</TableCell>
                        <TableCell align="right">{row.maxCGPA ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">No submitted ERPs yet</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

      {/* Top Students Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
      <Paper sx={{ p: 3, mt: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ p: 1.5, bgcolor: '#FEF3C7', borderRadius: 2 }}>
            <Trophy className="w-6 h-6 text-yellow-600" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>Top Students by Points</Typography>
            <Typography variant="body2" color="text.secondary">
              Leaderboard of highest performing students
            </Typography>
          </Box>
        </Box>
        {data.topStudents && data.topStudents.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Rank</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Roll Number</strong></TableCell>
                <TableCell><strong>Section</strong></TableCell>
                <TableCell align="right"><strong>Total Points</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.topStudents.map((s, idx) => {
                const getRankBadge = (rank) => {
                  if (rank === 1) return { color: 'gold', icon: '👑' };
                  if (rank === 2) return { color: 'silver', icon: '🥈' };
                  if (rank === 3) return { color: '#CD7F32', icon: '🥉' };
                  return { color: '#3B82F6', icon: null };
                };
                const badge = getRankBadge(idx + 1);
                return (
                  <TableRow 
                    key={s._id}
                    onClick={() => navigate(`/admin/students`)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#F9FAFB' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={600} color={badge.color}>
                          {idx + 1}
                        </Typography>
                        {badge.icon && <span style={{ fontSize: '1.2rem' }}>{badge.icon}</span>}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: badge.color, width: 36, height: 36 }}>
                          {s.name?.[0]}
                        </Avatar>
                        <Typography fontWeight={500}>{s.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{s.rollNumber}</TableCell>
                    <TableCell>
                      <Chip label={s.section} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Award className="w-4 h-4 text-blue-600" />
                        <Typography color="primary" fontWeight={700} variant="h6">
                          {s.totalPoints}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            No students with points yet
          </Typography>
        )}
      </Paper>
      </motion.div>
      </Container>
    </Box>
  );
}
