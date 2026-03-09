import { useState } from "react";
import axios from "../../api/axiosInstance";
import { Container, TextField, Button, Typography, Stack, MenuItem, CircularProgress, Box, Paper } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Upload } from "lucide-react";
import achievementIllustration from "../../assets/achievement-illustration.svg";

export default function AddAchievement() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    title: "", 
    achievementType: "",
    description: "", 
    category: "", 
    subCategory: "",
    dateOfIssue: "", 
    organizedInstitute: "",
    level: "",
    award: ""
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Form data before validation:", form);
    
    if (!form.title || !form.achievementType || !form.category || !form.dateOfIssue || !form.organizedInstitute || !form.level) {
      console.log("Validation failed. Missing fields:", {
        title: !!form.title,
        achievementType: !!form.achievementType,
        category: !!form.category,
        dateOfIssue: !!form.dateOfIssue,
        organizedInstitute: !!form.organizedInstitute,
        level: !!form.level
      });
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if non-technical category requires sub-category
    if (form.category === "Non-technical" && !form.subCategory) {
      toast.error("Please select a sub-category for non-technical achievements");
      return;
    }

    // Check if competition type requires award
    if (form.achievementType === "Competition" && !form.award) {
      toast.error("Please select an award for competition achievements");
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      
      // Always append required fields
      fd.append('title', form.title);
      fd.append('achievementType', form.achievementType);
      fd.append('category', form.category);
      fd.append('dateOfIssue', form.dateOfIssue);
      fd.append('organizedInstitute', form.organizedInstitute);
      fd.append('level', form.level);
      
      // Append optional fields only if they have values
      if (form.description) fd.append('description', form.description);
      if (form.subCategory) fd.append('subCategory', form.subCategory);
      if (form.award) fd.append('award', form.award);
      
      // Append multiple files
      files.forEach(file => {
        fd.append("proofFiles", file);
      });

      const res = await axios.post("/achievements/add", fd);
      toast.success(res.data.message || "Achievement submitted successfully!");
      
      // Reset form
      setForm({ 
        title: "", 
        achievementType: "",
        description: "", 
        category: "", 
        subCategory: "",
        dateOfIssue: "", 
        organizedInstitute: "",
        level: "",
        award: ""
      });
      setFiles([]);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error(err.response?.data?.message || "Failed to submit achievement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
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
              src={achievementIllustration}
              alt="Achievement Illustration"
              sx={{
                width: '100%',
                maxWidth: 280,
                height: 'auto'
              }}
            />
          </motion.div>
        </Box>

        {/* Form Side */}
        <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: 600 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Paper 
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'white'
              }}
            >
              {/* Header */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'inline-flex', 
                  p: 2, 
                  backgroundColor: '#6366F1', 
                  borderRadius: '50%', 
                  mb: 2 
                }}>
                  <Trophy className="w-8 h-8 text-white" />
                </Box>
                <Typography variant="h4" sx={{ color: '#1F2937', fontWeight: 700, fontFamily: 'Inter', mb: 1 }}>
                  Add Achievement
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  Share your accomplishments with the community
                </Typography>
              </Box>

              <Stack spacing={2} component="form" onSubmit={handleSubmit}>
                <TextField 
                  label="Title" 
                  required 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #D1D5DB'
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #6366F1'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #E5E7EB'
                      }
                    },
                  }}
                />

                <TextField 
                  select
                  label="Achievement Type" 
                  required 
                  value={form.achievementType} 
                  onChange={e => setForm({ ...form, achievementType: e.target.value, award: "" })} 
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #D1D5DB'
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #6366F1'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #E5E7EB'
                      }
                    },
                  }}
                >
                  <MenuItem value="Certification">Certification</MenuItem>
                  <MenuItem value="Competition">Competition</MenuItem>
                </TextField>
                
                <TextField 
                  select
                  label="Category" 
                  required 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value, subCategory: "" })} 
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #D1D5DB'
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #6366F1'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #E5E7EB'
                      }
                    },
                  }}
                >
                  <MenuItem value="Technical">Technical</MenuItem>
                  <MenuItem value="Non-technical">Non-technical</MenuItem>
                </TextField>

                {form.category === "Non-technical" && (
                  <TextField 
                    select
                    label="Sub-Category" 
                    required 
                    value={form.subCategory} 
                    onChange={e => setForm({ ...form, subCategory: e.target.value })} 
                    disabled={submitting}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#F9FAFB',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #D1D5DB'
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #6366F1'
                          }
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #E5E7EB'
                        }
                      },
                    }}
                  >
                    <MenuItem value="Co-curricular">Co-curricular (like quizzes, etc.)</MenuItem>
                    <MenuItem value="Extra-curricular">Extra-curricular (like dance, etc.)</MenuItem>
                  </TextField>
                )}
                
                <TextField 
                  type="date" 
                  label="Date of Issue" 
                  required
                  InputLabelProps={{ shrink: true }} 
                  value={form.dateOfIssue} 
                  onChange={e => setForm({ ...form, dateOfIssue: e.target.value })} 
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #D1D5DB'
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #6366F1'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #E5E7EB'
                      }
                    },
                  }}
                />

                <TextField 
                  label="Organized Institute Name" 
                  required 
                  value={form.organizedInstitute} 
                  onChange={e => setForm({ ...form, organizedInstitute: e.target.value })} 
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #D1D5DB'
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #6366F1'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #E5E7EB'
                      }
                    },
                  }}
                />

                <TextField 
                  select
                  label="Level of Certification" 
                  required 
                  value={form.level} 
                  onChange={e => setForm({ ...form, level: e.target.value })} 
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #D1D5DB'
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #6366F1'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #E5E7EB'
                      }
                    },
                  }}
                >
                  <MenuItem value="Department">Department</MenuItem>
                  <MenuItem value="College">College</MenuItem>
                  <MenuItem value="District">District</MenuItem>
                  <MenuItem value="State">State</MenuItem>
                  <MenuItem value="National">National</MenuItem>
                  <MenuItem value="International">International</MenuItem>
                </TextField>

                {form.achievementType === "Competition" && (
                  <TextField 
                    select
                    label="Award" 
                    required 
                    value={form.award} 
                    onChange={e => setForm({ ...form, award: e.target.value })} 
                    disabled={submitting}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#F9FAFB',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #D1D5DB'
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #6366F1'
                          }
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #E5E7EB'
                        }
                      },
                    }}
                  >
                    <MenuItem value="1">1st Place</MenuItem>
                    <MenuItem value="2">2nd Place</MenuItem>
                    <MenuItem value="3">3rd Place</MenuItem>
                    <MenuItem value="runner">Runner Up</MenuItem>
                    <MenuItem value="participation">Participation</MenuItem>
                  </TextField>
                )}
                
                <TextField 
                  label="Description" 
                  multiline 
                  rows={3} 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #D1D5DB'
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #6366F1'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #E5E7EB'
                      }
                    },
                  }}
                />
                
                <Button 
                  variant="outlined" 
                  component="label" 
                  disabled={submitting}
                  startIcon={<Upload className="w-5 h-5" />}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    borderColor: '#6366F1',
                    color: '#6366F1',
                    '&:hover': {
                      borderColor: '#4F46E5',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)'
                    }
                  }}
                >
                  {files.length > 0 ? `${files.length} file(s) selected` : "Upload Proof Files"}
                  <input 
                    type="file" 
                    hidden 
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => setFiles(Array.from(e.target.files))} 
                  />
                </Button>
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <Trophy className="w-5 h-5" />}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    backgroundColor: '#6366F1',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                      backgroundColor: '#4F46E5'
                    }
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Achievement"}
                </Button>
              </Stack>
            </Paper>
          </motion.div>
        </Box>
      </Box>
    </Container>
  );
}
