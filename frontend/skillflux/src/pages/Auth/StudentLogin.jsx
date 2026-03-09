import { useState } from "react";
import { Container, Paper, TextField, Button, Typography, Box, InputAdornment, IconButton, Divider, Chip } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { User, Lock, Eye, EyeOff, LogIn, UserCheck, ArrowLeft, Mail, BookOpen, GraduationCap, Award } from "lucide-react";
import loginLogo from "../../assets/logo.jpg";
import authIllustration from "../../assets/auth-illustration.svg";

export default function StudentLogin() {
  const [studentData, setStudentData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(studentData.email, studentData.password, false);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#FFFFFF',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.05)',
        filter: 'blur(60px)'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.03)',
        filter: 'blur(80px)'
      }} />
      <Box sx={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        opacity: 0.04
      }}>
        <BookOpen className="w-24 h-24" style={{ color: '#6366F1' }} />
      </Box>
      <Box sx={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        opacity: 0.04
      }}>
        <GraduationCap className="w-32 h-32" style={{ color: '#6366F1' }} />
      </Box>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        right: '15%',
        opacity: 0.03
      }}>
        <Award className="w-20 h-20" style={{ color: '#6366F1' }} />
      </Box>

      {/* Top Left Logo and Back Button */}
      <Box sx={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 2, zIndex: 10 }}>
        <Box
          component="img"
          src={loginLogo}
          alt="Vignan's Logo"
          sx={{
            height: 50,
            width: 'auto',
            objectFit: 'contain',
            backgroundColor: 'white',
            padding: 0.75,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB'
          }}
        />
        <IconButton 
          onClick={() => navigate('/')}
          sx={{ 
            color: '#6B7280',
            backgroundColor: '#F3F4F6',
            '&:hover': {
              backgroundColor: '#E5E7EB'
            }
          }}
        >
          <ArrowLeft className="w-6 h-6" />
        </IconButton>
      </Box>

      {/* Split Layout Container */}
      <Container maxWidth="lg" sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* Illustration Side - Hidden on mobile */}
        <Box sx={{ 
          flex: 1, 
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box
              component="img"
              src={authIllustration}
              alt="Education Illustration"
              sx={{
                width: '100%',
                maxWidth: 500,
                height: 'auto'
              }}
            />
          </motion.div>
        </Box>

        {/* Form Side */}
        <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: 500 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper 
            elevation={0}
            sx={{
              backgroundColor: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Header with decorative elements */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', 
              p: 4, 
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative circles */}
              <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                opacity: 0.5
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                opacity: 0.5
              }} />
              
              {/* Education icons decoration */}
              <Box sx={{ position: 'absolute', top: 20, left: 30, opacity: 0.2 }}>
                <BookOpen className="w-6 h-6 text-white" />
              </Box>
              <Box sx={{ position: 'absolute', top: 30, right: 40, opacity: 0.2 }}>
                <GraduationCap className="w-6 h-6 text-white" />
              </Box>
              
              <Box
                component="img"
                src={loginLogo}
                alt="Vignan's Logo"
                sx={{
                  height: 64,
                  width: 'auto',
                  objectFit: 'contain',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: 1.5,
                  borderRadius: '12px',
                  mb: 2,
                  display: 'inline-block',
                  position: 'relative',
                  zIndex: 1,
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}
              />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, fontFamily: 'Inter', position: 'relative', zIndex: 1 }}>
                Student Login
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.95)', mt: 1, position: 'relative', zIndex: 1 }}>
                Sign in to access your achievements
              </Typography>
            </Box>

            {/* Student Login Form */}
            <Box className="p-8">
              <motion.form 
                onSubmit={handleStudentLogin}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  variant="outlined"
                  margin="normal"
                  value={studentData.email}
                  onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                  required
                  placeholder="student@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white'
                      }
                    },
                  }}
                />
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  variant="outlined"
                  margin="normal"
                  value={studentData.password}
                  onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white'
                      }
                    },
                  }}
                />
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    fullWidth 
                    variant="contained"
                    disabled={loading}
                    endIcon={<LogIn className="w-5 h-5" />}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      backgroundColor: '#6366F1',
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                      '&:hover': {
                        backgroundColor: '#4F46E5'
                      }
                    }}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </motion.div>

                <Divider className="my-4">
                  <Chip label="OR" size="small" />
                </Divider>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                  <Award className="w-4 h-4 text-gray-400" />
                  <Typography variant="body2" className="text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      style={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Register Now
                    </Link>
                  </Typography>
                </Box>
              </motion.form>
            </Box>
          </Paper>
        </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
