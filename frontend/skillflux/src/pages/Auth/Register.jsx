import { useState } from "react";
import { Container, TextField, Button, Typography, Box, MenuItem, Paper, IconButton, InputAdornment } from "@mui/material";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, UserPlus, BookOpen, GraduationCap, Award, Mail, Lock, User, Hash, Building2, Layers, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import registerIllustration from "../../assets/register-illustration.svg";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", rollNumber: "", password: "", department: "", section: "", year: "", admissionYear: ""
  });
  const [emailError, setEmailError] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    
    // Calculate graduation year when admission year changes
    if (e.target.name === "admissionYear" && e.target.value) {
      const admYear = parseInt(e.target.value);
      if (!isNaN(admYear) && admYear >= 2000 && admYear <= 2100) {
        const gradYear = admYear + 4;
        setGraduationYear(gradYear);
      } else {
        setGraduationYear("");
      }
    }
    
    // Validate email on change
    if (e.target.name === "email") {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(e.target.value) && e.target.value !== "") {
        setEmailError("Please enter a valid email address (e.g., student@example.com)");
      } else {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email before submission
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      setEmailError("Please enter a valid email address (e.g., student@example.com)");
      return;
    }
    
    try {
      await axios.post("/auth/register", form);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
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
        top: '15%',
        left: '8%',
        opacity: 0.04
      }}>
        <BookOpen className="w-24 h-24" style={{ color: '#6366F1' }} />
      </Box>
      <Box sx={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        opacity: 0.04
      }}>
        <GraduationCap className="w-28 h-28" style={{ color: '#6366F1' }} />
      </Box>
      <Box sx={{
        position: 'absolute',
        top: '45%',
        right: '12%',
        opacity: 0.03
      }}>
        <Award className="w-20 h-20" style={{ color: '#6366F1' }} />
      </Box>
      {/* Back Button */}
      <IconButton 
        onClick={() => navigate('/login')}
        sx={{ 
          position: 'absolute', 
          top: 32, 
          left: 32,
          zIndex: 10,
          color: '#6B7280',
          backgroundColor: '#F3F4F6',
          '&:hover': {
            backgroundColor: '#E5E7EB'
          }
        }}
      >
        <ArrowLeft className="w-6 h-6" />
      </IconButton>

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
              src={registerIllustration}
              alt="Student Registration Illustration"
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
              p: 4,
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Header with gradient background */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', 
              textAlign: 'center', 
              py: 4, 
              px: 3, 
              mx: -4, 
              mt: -4, 
              mb: 3,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '16px 16px 0 0'
            }}>
              {/* Decorative elements */}
              <Box sx={{
                position: 'absolute',
                top: -15,
                right: -15,
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                opacity: 0.5
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                opacity: 0.5
              }} />
              
              {/* Education icons decoration */}
              <Box sx={{ position: 'absolute', top: 20, left: 30, opacity: 0.2 }}>
                <BookOpen className="w-5 h-5 text-white" />
              </Box>
              <Box sx={{ position: 'absolute', top: 25, right: 35, opacity: 0.2 }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </Box>
              <Box sx={{ position: 'absolute', bottom: 20, right: 20, opacity: 0.15 }}>
                <Award className="w-5 h-5 text-white" />
              </Box>
              
              <Box sx={{ 
                display: 'inline-flex', 
                p: 2.5, 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                borderRadius: '50%', 
                mb: 2,
                position: 'relative',
                zIndex: 1,
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                <UserPlus className="w-8 h-8 text-white" />
              </Box>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, fontFamily: 'Inter', mb: 1, position: 'relative', zIndex: 1 }}>
                Student Registration
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.95)', position: 'relative', zIndex: 1 }}>
                Create your account to get started
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
        <TextField 
          fullWidth 
          label="Full Name" 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          margin="normal" 
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <User className="w-5 h-5 text-gray-400" />
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
          label="Email" 
          name="email" 
          type="email"
          value={form.email} 
          onChange={handleChange} 
          margin="normal" 
          required 
          error={!!emailError}
          helperText={emailError || "Use a valid email address (e.g., student@example.com)"}
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
          label="Roll Number" 
          name="rollNumber" 
          value={form.rollNumber} 
          onChange={handleChange} 
          margin="normal" 
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Hash className="w-5 h-5 text-gray-400" />
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
          label="Password" 
          name="password" 
          type="password" 
          value={form.password} 
          onChange={handleChange} 
          margin="normal" 
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock className="w-5 h-5 text-gray-400" />
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
          select 
          label="Department" 
          name="department" 
          value={form.department} 
          onChange={handleChange} 
          margin="normal" 
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Building2 className="w-5 h-5 text-gray-400" />
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
        >
          {["CSE", "ECE", "Civil", "EEE", "Mechanical", "IT", "Chemical", "Biotech"].map((dept) => (
            <MenuItem key={dept} value={dept}>{dept}</MenuItem>
          ))}
        </TextField>

        <TextField 
          fullWidth 
          select 
          label="Section" 
          name="section" 
          value={form.section} 
          onChange={handleChange} 
          margin="normal" 
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Layers className="w-5 h-5 text-gray-400" />
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
        >
          {["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S"].map((sec) => (
            <MenuItem key={sec} value={sec}>{sec}</MenuItem>
          ))}
        </TextField>

        <TextField 
          fullWidth 
          select 
          label="Year" 
          name="year" 
          value={form.year} 
          onChange={handleChange} 
          margin="normal" 
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Calendar className="w-5 h-5 text-gray-400" />
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
        >
          {["I","II","III","IV"].map((yr) => (
            <MenuItem key={yr} value={yr}>{yr}</MenuItem>
          ))}
        </TextField>

        {/* Admission Year (From) */}
        <TextField 
          fullWidth 
          label="Admission Year" 
          name="admissionYear" 
          type="number"
          value={form.admissionYear} 
          onChange={handleChange} 
          margin="normal" 
          required
          placeholder="2028"
          inputProps={{
            min: 2000,
            max: 2100,
            step: 1
          }}
          helperText="Enter the year you were admitted to college"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GraduationCap className="w-5 h-5 text-gray-400" />
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

        {/* Expected Graduation Year (To) - Auto-calculated */}
        {graduationYear && (
          <Box sx={{ 
            mt: 2, 
            mb: 1,
            p: 2, 
            backgroundColor: '#EEF2FF', 
            borderRadius: '12px',
            border: '1px solid #C7D2FE'
          }}>
            <Typography variant="body2" sx={{ color: '#4F46E5', fontWeight: 600 }}>
              Expected Graduation: {graduationYear} (Academic Batch: {form.admissionYear}-{graduationYear})
            </Typography>
          </Box>
        )}

              <Button 
                fullWidth 
                variant="contained" 
                type="submit"
                endIcon={<UserPlus className="w-5 h-5" />}
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
                Create Account
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#6B7280' }}>
                  Already have an account?{' '}
                  <Button 
                    onClick={() => navigate('/login')} 
                    sx={{ 
                      color: '#6366F1', 
                      fontWeight: 600, 
                      textTransform: 'none',
                      p: 0,
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Sign In
                  </Button>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
