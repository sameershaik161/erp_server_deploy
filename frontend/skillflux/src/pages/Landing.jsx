import React, { useState, useEffect } from "react";
import { Box, Button, Container, Typography, Stack, Grid, Card, IconButton, Chip, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Users, TrendingUp, Star, ArrowRight, CheckCircle, School, Target, Sparkles } from "lucide-react";
import bg1 from "../assets/bg.jpg";
import bg2 from "../assets/WhatsApp Image 2025-11-06 at 11.21.21_5fbdf5c4.jpg";
import bg3 from "../assets/u.jpg";
import bg4 from "../assets/a.jpg";

export default function Landing() {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const backgrounds = [bg1, bg2, bg3, bg4];

  const features = [
    { icon: Trophy, title: "Track Achievements", desc: "Record and showcase your academic and extracurricular accomplishments" },
    { icon: Target, title: "ERP Integration", desc: "Complete student profile with academic records and personal details" },
    { icon: Sparkles, title: "AI-Powered Analysis", desc: "Get intelligent insights and recommendations for your certificates" },
    { icon: School, title: "Career Opportunities", desc: "Stay updated with placement drives and academic announcements" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* Hero Section with Background Slideshow */}
      <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        {/* Background Slideshow - Only for Hero Section */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          {backgrounds.map((bg, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: currentBgIndex === index ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                zIndex: 0
              }}
            />
          ))}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1
            }}
          />
        </Box>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ textAlign: 'center' }}
            >
              <Chip 
                label="🎓 Student ERP Portal" 
                sx={{ 
                  fontSize: '0.9rem', 
                  py: 2.5, 
                  px: 2,
                  mb: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              />
              
              <Typography 
                variant="h2" 
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' }, 
                  fontFamily: 'Inter',
                  fontWeight: 800,
                  color: '#FF0000',
                  mb: 2,
                  lineHeight: 1.2,
                  textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)',
                  letterSpacing: '2px'
                }}
              >
                VIGNAN'S
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontSize: { xs: '1.25rem', md: '1.75rem', lg: '2.25rem' }, 
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  color: 'white',
                  mb: 4,
                  lineHeight: 1.4,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                  letterSpacing: '1px'
                }}
              >
                FOUNDATION FOR SCIENCE, TECHNOLOGY & RESEARCH
              </Typography>
              
              <Typography variant="h6" sx={{ color: 'white', mb: 6, lineHeight: 1.6, fontWeight: 400, textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)', fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Empowering Innovation • Celebrating Achievements • Inspiring Excellence
              </Typography>

              {/* CTA Buttons */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} justifyContent="center" className="mb-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/login")}
                    endIcon={<ArrowRight />}
                    sx={{
                      backgroundColor: 'rgba(99, 102, 241, 0.9)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(79, 70, 229, 1)'
                      }
                    }}
                  >
                    Student Login
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/register")}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  >
                    Register Now
                  </Button>
                </motion.div>
              </Stack>

              {/* Admin Access */}
              <Typography variant="body2" sx={{ color: 'white', mt: 4, textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)', fontSize: '1rem' }}>
                Administrator? 
                <Button 
                  onClick={() => navigate("/admin-login")} 
                  sx={{ 
                    color: 'white',
                    textTransform: 'none',
                    textDecoration: 'underline',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Access Admin Panel
                </Button>
              </Typography>
            </motion.div>
          </Grid>
        </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'white', py: 10 }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h4" sx={{ textAlign: 'center', color: '#1F2937', fontWeight: 700, mb: 6, fontFamily: 'Inter' }}>
              Why Choose Our Portal?
            </Typography>
            
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <Card 
                      elevation={0}
                      sx={{
                        height: '100%',
                        p: 3,
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          borderColor: '#6366F1'
                        }
                      }}
                    >
                      <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '8px', backgroundColor: '#6366F1', mb: 2 }}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </Box>
                      <Typography variant="h6" sx={{ color: '#1F2937', fontWeight: 600, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        {feature.desc}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid #E5E7EB', py: 4, backgroundColor: 'white' }}>
        <Container>
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#6B7280' }}>
            {new Date().getFullYear()} Vignan's Foundation for Science, Technology & Research. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
