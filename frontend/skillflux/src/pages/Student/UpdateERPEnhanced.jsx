// import { useState, useEffect } from "react";
// import axios from "../../api/axiosInstance";
// import {
//   Container, Typography, Button, Box, Paper, Accordion, AccordionSummary, AccordionDetails,
//   TextField, Grid, MenuItem, IconButton, Chip, CircularProgress, Radio,
//   RadioGroup, FormControlLabel, FormControl, FormLabel, Divider
// } from "@mui/material";
// import { Add, Delete, ExpandMore, Edit, Save, CheckCircle, Warning, Lock } from "@mui/icons-material";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";

// export default function UpdateERPEnhanced() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [erp, setErp] = useState(null);

//   // Section editing states - Start with editing enabled for better UX
//   const [editingPersonal, setEditingPersonal] = useState(true);
//   const [editingAcademic, setEditingAcademic] = useState(true);
//   const [editingTraining, setEditingTraining] = useState(true);

//   // Completion status helpers
//   const personalComplete = erp && isPersonalComplete(erp);
//   const academicComplete = erp && isAcademicComplete(erp);
//   const trainingComplete = erp && isTrainingComplete(erp);

//   // Check if personal information is complete
//   function isPersonalComplete(erpData) {
//     return (
//       erpData.fullName &&
//       erpData.email &&
//       erpData.phoneNumber &&
//       erpData.dateOfBirth &&
//       erpData.address &&
//       erpData.fatherName &&
//       erpData.motherName &&
//       erpData.bloodGroup &&
//       erpData.category &&
//       erpData.religion
//     );
//   }

//   // Check if academic details are complete
//   function isAcademicComplete(erpData) {
//     return (
//       erpData.currentSemester &&
//       erpData.branch &&
//       erpData.rollNumber &&
//       erpData.cgpa !== undefined &&
//       erpData.semesters &&
//       erpData.semesters.length > 0
//     );
//   }

//   // Check if training information is complete
//   function isTrainingComplete(erpData) {
//     return (
//       erpData.skills &&
//       erpData.skills.length > 0 &&
//       erpData.projects &&
//       erpData.projects.length > 0
//     );
//   }

//   useEffect(() => {
//     fetchERPProfile();
//   }, []);

//   const fetchERPProfile = async () => {
//     try {
//       const response = await axios.get("/erp/profile");
//       setErp(response.data.erp || getInitialERPData());
//     } catch (error) {
//       console.error("Error fetching ERP profile:", error);
//       setErp(getInitialERPData());
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getInitialERPData = () => ({
//     // Personal Information
//     fullName: "", email: "", phoneNumber: "", dateOfBirth: "",
//     address: "", fatherName: "", motherName: "", bloodGroup: "", category: "", religion: "",

//     // Academic Information
//     currentSemester: "", branch: "", rollNumber: "", cgpa: 0,
//     semesters: [], courses: [],

//     // Training & Skills
//     skills: [], projects: [], internships: [], certifications: []
//   });

//   const savePersonalInfo = async () => {
//     if (!personalComplete) {
//       toast.error("Please fill all required personal information fields");
//       return;
//     }

//     try {
//       await axios.put("/erp/update-profile", { personalInfo: erp });
//       toast.success("Personal information saved successfully!");
//       setEditingPersonal(false);
//     } catch (error) {
//       toast.error("Failed to save personal information");
//     }
//   };

//   const saveAcademicInfo = async () => {
//     if (!academicComplete) {
//       toast.error("Please complete all academic information fields");
//       return;
//     }

//     try {
//       await axios.put("/erp/update-profile", { academicInfo: erp });
//       toast.success("Academic information saved successfully!");
//       setEditingAcademic(false);
//     } catch (error) {
//       toast.error("Failed to save academic information");
//     }
//   };

//   const saveTrainingInfo = async () => {
//     if (!trainingComplete) {
//       toast.error("Please complete training and skills information");
//       return;
//     }

//     try {
//       await axios.put("/erp/update-profile", { trainingInfo: erp });
//       toast.success("Training information saved successfully!");
//       setEditingTraining(false);
//     } catch (error) {
//       toast.error("Failed to save training information");
//     }
//   };

//   const handleFileUpload = async (file, type) => {
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("type", type);

//     try {
//       const response = await axios.post("/erp/upload-file", formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });

//       setErp(prev => ({
//         ...prev,
//         [type]: response.data.fileUrl
//       }));

//       toast.success(`${type} uploaded successfully!`);
//     } catch (error) {
//       toast.error(`Failed to upload ${type}`);
//     }
//   };

//   const addItem = (section, newItem) => {
//     setErp(prev => ({
//       ...prev,
//       [section]: [...(prev[section] || []), newItem]
//     }));
//   };

//   const removeItem = (section, index) => {
//     setErp(prev => ({
//       ...prev,
//       [section]: prev[section].filter((_, i) => i !== index)
//     }));
//   };

//   const updateItem = (section, index, updatedItem) => {
//     setErp(prev => ({
//       ...prev,
//       [section]: prev[section].map((item, i) => i === index ? updatedItem : item)
//     }));
//   };

//   if (loading) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
//         <CircularProgress size={60} />
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       {/* Professional Header Section */}
//       <Box sx={{ mb: 4 }}>
//         <Typography
//           variant="h3"
//           sx={{
//             fontWeight: 700,
//             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             mb: 1
//           }}
//         >
//           Update My ERP Profile
//         </Typography>
//         <Typography
//           variant="h6"
//           color="text.secondary"
//           sx={{ mb: 1, maxWidth: '700px' }}
//         >
//           Complete your Educational Record Profile with comprehensive information for admin verification
//         </Typography>
//         <Typography
//           variant="body2"
//           color="primary"
//           sx={{ mb: 3, maxWidth: '700px', fontWeight: 500 }}
//         >
//           💡 Tip: Fill out each section and click "Save Section" to save your progress. You can edit anytime!
//         </Typography>

//         {/* Progress Indicator */}
//         <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
//           <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#495057' }}>
//             Completion Progress
//           </Typography>
//           <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <CheckCircle color={personalComplete ? 'success' : 'disabled'} />
//               <Typography
//                 variant="body2"
//                 sx={{
//                   fontWeight: personalComplete ? 600 : 400,
//                   color: personalComplete ? '#28a745' : '#6c757d'
//                 }}
//               >
//                 Personal Details
//               </Typography>
//             </Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <CheckCircle color={(academicComplete && personalComplete) ? 'success' : 'disabled'} />
//               <Typography
//                 variant="body2"
//                 sx={{
//                   fontWeight: (academicComplete && personalComplete) ? 600 : 400,
//                   color: (academicComplete && personalComplete) ? '#28a745' : '#6c757d'
//                 }}
//               >
//                 Academic Details
//               </Typography>
//             </Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <CheckCircle color={(trainingComplete && personalComplete) ? 'success' : 'disabled'} />
//               <Typography
//                 variant="body2"
//                 sx={{
//                   fontWeight: (trainingComplete && personalComplete) ? 600 : 400,
//                   color: (trainingComplete && personalComplete) ? '#28a745' : '#6c757d'
//                 }}
//               >
//                 Training & Projects
//               </Typography>
//             </Box>
//             <Box sx={{ ml: 'auto' }}>
//               <Chip
//                 label={`${[personalComplete, academicComplete, trainingComplete].filter(Boolean).length}/3 Complete`}
//                 color={[personalComplete, academicComplete, trainingComplete].every(Boolean) ? 'success' : 'primary'}
//                 variant="outlined"
//               />
//             </Box>
//           </Box>
//         </Paper>
//       </Box>

//       {/* Personal Information Section */}
//       <Paper
//         elevation={personalComplete ? 3 : 1}
//         sx={{
//           mb: 3,
//           overflow: 'hidden',
//           border: personalComplete ? '2px solid #28a745' : '1px solid #e0e0e0',
//           borderRadius: 2
//         }}
//       >
//         <Accordion
//           expanded={true}
//           sx={{
//             boxShadow: 'none',
//             '&:before': { display: 'none' }
//           }}
//         >
//           <AccordionSummary
//             expandIcon={<ExpandMore />}
//             sx={{
//               backgroundColor: personalComplete
//                 ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
//                 : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
//               borderBottom: '1px solid #dee2e6',
//               minHeight: 64,
//               '& .MuiAccordionSummary-content': {
//                 alignItems: 'center',
//                 gap: 2,
//                 my: 2
//               }
//             }}
//           >
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
//               <Box
//                 sx={{
//                   width: 40,
//                   height: 40,
//                   borderRadius: '50%',
//                   backgroundColor: personalComplete ? '#28a745' : '#6c757d',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: 'white',
//                   fontWeight: 'bold'
//                 }}
//               >
//                 1
//               </Box>
//               <Box>
//                 <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529' }}>
//                   Personal Information
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Complete your personal & financial information
//                 </Typography>
//               </Box>
//               {personalComplete && (
//                 <Chip
//                   icon={<CheckCircle />}
//                   label="Complete"
//                   color="success"
//                   size="small"
//                 />
//               )}
//               <Box sx={{ flex: 1 }} />
//               {editingPersonal ? (
//                 <Button
//                   size="small"
//                   startIcon={<Save />}
//                   variant="contained"
//                   color="success"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     savePersonalInfo();
//                   }}
//                   sx={{ mr: 1 }}
//                 >
//                   Save Section
//                 </Button>
//               ) : (
//                 <Button
//                   size="small"
//                   startIcon={<Edit />}
//                   variant="outlined"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setEditingPersonal(true);
//                   }}
//                   sx={{ mr: 1, minWidth: '120px' }}
//                 >
//                   Edit Section
//                 </Button>
//               )}
//             </Box>
//           </AccordionSummary>
//           <AccordionDetails>
//             <PersonalInfoForm
//               erp={erp}
//               setErp={setErp}
//               disabled={!editingPersonal}
//               onFileUpload={handleFileUpload}
//             />
//           </AccordionDetails>
//         </Accordion>
//       </Paper>

//       {/* Academic Details Section */}
//       <Paper
//         elevation={(academicComplete && personalComplete) ? 3 : 1}
//         sx={{
//           mb: 3,
//           overflow: 'hidden',
//           border: (academicComplete && personalComplete) ? '2px solid #28a745' : '1px solid #e0e0e0',
//           borderRadius: 2,
//           opacity: personalComplete ? 1 : 0.6,
//           position: 'relative'
//         }}
//       >
//         {!personalComplete && (
//           <Box
//             sx={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: 'rgba(255,255,255,0.8)',
//               zIndex: 1,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               backdropFilter: 'blur(2px)'
//             }}
//           >
//             <Paper
//               sx={{
//                 p: 3,
//                 textAlign: 'center',
//                 backgroundColor: '#fff3cd',
//                 border: '1px solid #ffeaa7',
//                 borderRadius: 2,
//                 maxWidth: 400
//               }}
//             >
//               <Warning color="warning" sx={{ fontSize: 40, mb: 2 }} />
//               <Typography variant="h6" sx={{ fontWeight: 600, color: '#856404', mb: 1 }}>
//                 Complete Personal Information First
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Please complete all personal information fields before accessing academic details
//               </Typography>
//             </Paper>
//           </Box>
//         )}

//         <Accordion
//           expanded={true}
//           disabled={!personalComplete}
//           sx={{
//             boxShadow: 'none',
//             '&:before': { display: 'none' }
//           }}
//         >
//           <AccordionSummary
//             expandIcon={<ExpandMore />}
//             sx={{
//               backgroundColor: (academicComplete && personalComplete)
//                 ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
//                 : personalComplete
//                   ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
//                   : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
//               borderBottom: '1px solid #dee2e6',
//               minHeight: 64,
//               '& .MuiAccordionSummary-content': {
//                 alignItems: 'center',
//                 gap: 2,
//                 my: 2
//               }
//             }}
//           >
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
//               <Box
//                 sx={{
//                   width: 40,
//                   height: 40,
//                   borderRadius: '50%',
//                   backgroundColor: (academicComplete && personalComplete) ? '#28a745' : personalComplete ? '#007bff' : '#6c757d',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: 'white',
//                   fontWeight: 'bold'
//                 }}
//               >
//                 2
//               </Box>
//               <Box>
//                 <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529' }}>
//                   Academic Details
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Educational background, CGPA, and academic achievements
//                 </Typography>
//               </Box>
//               {(academicComplete && personalComplete) && (
//                 <Chip
//                   icon={<CheckCircle />}
//                   label="Complete"
//                   color="success"
//                   size="small"
//                 />
//               )}
//               <Box sx={{ flex: 1 }} />
//               {editingAcademic && personalComplete ? (
//                 <Button
//                   size="small"
//                   startIcon={<Save />}
//                   variant="contained"
//                   color="success"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     saveAcademicInfo();
//                   }}
//                   sx={{ mr: 1 }}
//                 >
//                   Save Section
//                 </Button>
//               ) : personalComplete ? (
//                 <Button
//                   size="small"
//                   startIcon={<Edit />}
//                   variant="outlined"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setEditingAcademic(true);
//                   }}
//                   sx={{ mr: 1, minWidth: '120px' }}
//                 >
//                   Edit Section
//                 </Button>
//               ) : (
//                 <Chip
//                   label="Locked"
//                   color="default"
//                   size="small"
//                   icon={<Lock />}
//                 />
//               )}
//             </Box>
//           </AccordionSummary>
//           <AccordionDetails>
//             <AcademicDetailsForm
//               erp={erp}
//               setErp={setErp}
//               disabled={!editingAcademic || !personalComplete}
//               addItem={addItem}
//               removeItem={removeItem}
//               updateItem={updateItem}
//             />
//           </AccordionDetails>
//         </Accordion>
//       </Paper>

//       {/* Training & Skills Section */}
//       <Paper
//         elevation={(trainingComplete && personalComplete) ? 3 : 1}
//         sx={{
//           mb: 3,
//           overflow: 'hidden',
//           border: (trainingComplete && personalComplete) ? '2px solid #28a745' : '1px solid #e0e0e0',
//           borderRadius: 2,
//           opacity: personalComplete ? 1 : 0.6,
//           position: 'relative'
//         }}
//       >
//         {!personalComplete && (
//           <Box
//             sx={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: 'rgba(255,255,255,0.8)',
//               zIndex: 1,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               backdropFilter: 'blur(2px)'
//             }}
//           >
//             <Paper
//               sx={{
//                 p: 3,
//                 textAlign: 'center',
//                 backgroundColor: '#fff3cd',
//                 border: '1px solid #ffeaa7',
//                 borderRadius: 2,
//                 maxWidth: 400
//               }}
//             >
//               <Warning color="warning" sx={{ fontSize: 40, mb: 2 }} />
//               <Typography variant="h6" sx={{ fontWeight: 600, color: '#856404', mb: 1 }}>
//                 Complete Personal Information First
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Please complete all personal information fields before accessing training details
//               </Typography>
//             </Paper>
//           </Box>
//         )}

//         <Accordion
//           expanded={true}
//           disabled={!personalComplete}
//           sx={{
//             boxShadow: 'none',
//             '&:before': { display: 'none' }
//           }}
//         >
//           <AccordionSummary
//             expandIcon={<ExpandMore />}
//             sx={{
//               backgroundColor: (trainingComplete && personalComplete)
//                 ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
//                 : personalComplete
//                   ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
//                   : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
//               borderBottom: '1px solid #dee2e6',
//               minHeight: 64,
//               '& .MuiAccordionSummary-content': {
//                 alignItems: 'center',
//                 gap: 2,
//                 my: 2
//               }
//             }}
//           >
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
//               <Box
//                 sx={{
//                   width: 40,
//                   height: 40,
//                   borderRadius: '50%',
//                   backgroundColor: (trainingComplete && personalComplete) ? '#28a745' : personalComplete ? '#007bff' : '#6c757d',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: 'white',
//                   fontWeight: 'bold'
//                 }}
//               >
//                 3
//               </Box>
//               <Box>
//                 <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529' }}>
//                   Training & Projects
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Skills, certifications, projects, and professional training
//                 </Typography>
//               </Box>
//               {(trainingComplete && personalComplete) && (
//                 <Chip
//                   icon={<CheckCircle />}
//                   label="Complete"
//                   color="success"
//                   size="small"
//                 />
//               )}
//               <Box sx={{ flex: 1 }} />
//               {editingTraining && personalComplete ? (
//                 <Button
//                   size="small"
//                   startIcon={<Save />}
//                   variant="contained"
//                   color="success"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     saveTrainingInfo();
//                   }}
//                   sx={{ mr: 1 }}
//                 >
//                   Save Section
//                 </Button>
//               ) : personalComplete ? (
//                 <Button
//                   size="small"
//                   startIcon={<Edit />}
//                   variant="outlined"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setEditingTraining(true);
//                   }}
//                   sx={{ mr: 1, minWidth: '120px' }}
//                 >
//                   Edit Section
//                 </Button>
//               ) : (
//                 <Chip
//                   label="Locked"
//                   color="default"
//                   size="small"
//                   icon={<Lock />}
//                 />
//               )}
//             </Box>
//           </AccordionSummary>
//           <AccordionDetails>
//             <TrainingDetailsForm
//               erp={erp}
//               setErp={setErp}
//               disabled={!editingTraining || !personalComplete}
//               addItem={addItem}
//               removeItem={removeItem}
//               updateItem={updateItem}
//             />
//           </AccordionDetails>
//         </Accordion>
//       </Paper>

//       {/* Professional Review & Submission Section */}
//       <Paper
//         elevation={4}
//         sx={{
//           mt: 4,
//           p: 4,
//           background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
//           border: '1px solid #dee2e6',
//           borderRadius: 3
//         }}
//       >
//         <Box sx={{ textAlign: 'center', mb: 4 }}>
//           <Typography
//             variant="h5"
//             sx={{
//               fontWeight: 700,
//               color: '#495057',
//               mb: 1
//             }}
//           >
//             Profile Review & Submission
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             Review your profile completion status and submit for admin verification
//           </Typography>
//         </Box>

//         {/* Completion Summary */}
//         <Box sx={{ textAlign: 'center', mb: 3 }}>
//           <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
//             Overall Progress: {[personalComplete, academicComplete, trainingComplete].filter(Boolean).length}/3 Sections Complete
//           </Typography>
//           <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mb: 3 }}>
//             <Box
//               sx={{
//                 width: '100%',
//                 height: 12,
//                 backgroundColor: '#e0e0e0',
//                 borderRadius: 6,
//                 overflow: 'hidden'
//               }}
//             >
//               <Box
//                 sx={{
//                   width: `${([personalComplete, academicComplete, trainingComplete].filter(Boolean).length / 3) * 100}%`,
//                   height: '100%',
//                   background: 'linear-gradient(90deg, #28a745 0%, #20c997 100%)',
//                   borderRadius: 6,
//                   transition: 'width 0.5s ease'
//                 }}
//               />
//             </Box>
//           </Box>
//         </Box>

//         <Grid container spacing={2} sx={{ mb: 4 }}>
//           <Grid item xs={12} md={4}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: personalComplete ? '#d4edda' : '#fff3cd', borderRadius: 1 }}>
//               {personalComplete ? <CheckCircle color="success" /> : <Warning color="warning" />}
//               <Typography sx={{ fontWeight: 600 }}>Personal Information</Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: academicComplete ? '#d4edda' : '#fff3cd', borderRadius: 1 }}>
//               {academicComplete ? <CheckCircle color="success" /> : <Warning color="warning" />}
//               <Typography sx={{ fontWeight: 600 }}>Academic Details</Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: trainingComplete ? '#d4edda' : '#fff3cd', borderRadius: 1 }}>
//               {trainingComplete ? <CheckCircle color="success" /> : <Warning color="warning" />}
//               <Typography sx={{ fontWeight: 600 }}>Training & Skills</Typography>
//             </Box>
//           </Grid>
//         </Grid>

//         {personalComplete && academicComplete && trainingComplete ? (
//           <Box sx={{ mt: 4, textAlign: 'center' }}>
//             <Box
//               sx={{
//                 p: 3,
//                 mb: 3,
//                 backgroundColor: '#d4edda',
//                 border: '1px solid #c3e6cb',
//                 borderRadius: 2,
//                 maxWidth: 500,
//                 mx: 'auto'
//               }}
//             >
//               <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
//               <Typography
//                 variant="h5"
//                 sx={{
//                   fontWeight: 700,
//                   color: '#155724',
//                   mb: 1
//                 }}
//               >
//                 🎉 Profile Complete!
//               </Typography>
//               <Typography variant="body1" color="text.secondary">
//                 Your ERP profile is now complete and ready for admin verification.
//               </Typography>
//             </Box>

//             <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
//               <Button
//                 variant="contained"
//                 size="large"
//                 sx={{
//                   px: 4,
//                   py: 1.5,
//                   background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
//                   fontWeight: 600
//                 }}
//                 onClick={() => {
//                   toast.success('Profile submitted successfully for verification!');
//                   navigate('/student/dashboard');
//                 }}
//               >
//                 ✓ Submit for Verification
//               </Button>

//               <Button
//                 variant="outlined"
//                 size="large"
//                 onClick={() => navigate('/student/dashboard')}
//               >
//                 Back to Dashboard
//               </Button>
//             </Box>
//           </Box>
//         ) : (
//           <Box sx={{ mt: 4, textAlign: 'center' }}>
//             <Box
//               sx={{
//                 p: 3,
//                 mb: 3,
//                 backgroundColor: '#fff3cd',
//                 border: '1px solid #ffeaa7',
//                 borderRadius: 2,
//                 maxWidth: 500,
//                 mx: 'auto'
//               }}
//             >
//               <Warning color="warning" sx={{ fontSize: 48, mb: 2 }} />
//               <Typography
//                 variant="h6"
//                 sx={{
//                   fontWeight: 600,
//                   color: '#856404',
//                   mb: 1
//                 }}
//               >
//                 Profile Incomplete
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Please complete all sections before submitting for verification.
//               </Typography>
//             </Box>

//             <Button
//               variant="outlined"
//               size="large"
//               onClick={() => navigate('/student/dashboard')}
//             >
//               Save Progress & Return Later
//             </Button>
//           </Box>
//         )}
//       </Paper>
//     </Container>
//   );
// }

// // Form Components (Simplified versions - you can replace with actual complex forms)

// function PersonalInfoForm({ erp, setErp, disabled, onFileUpload }) {
//   return (
//     <Grid container spacing={3}>
//       <Grid item xs={12} md={6}>
//         <TextField
//           fullWidth
//           label="Full Name"
//           value={erp.fullName || ''}
//           onChange={(e) => setErp({ ...erp, fullName: e.target.value })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <TextField
//           fullWidth
//           label="Email"
//           type="email"
//           value={erp.email || ''}
//           onChange={(e) => setErp({ ...erp, email: e.target.value })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <TextField
//           fullWidth
//           label="Phone Number"
//           value={erp.phoneNumber || ''}
//           onChange={(e) => setErp({ ...erp, phoneNumber: e.target.value })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <TextField
//           fullWidth
//           label="Date of Birth"
//           type="date"
//           value={erp.dateOfBirth || ''}
//           onChange={(e) => setErp({ ...erp, dateOfBirth: e.target.value })}
//           disabled={disabled}
//           required
//           InputLabelProps={{ shrink: true }}
//         />
//       </Grid>
//       <Grid item xs={12}>
//         <TextField
//           fullWidth
//           label="Address"
//           multiline
//           rows={2}
//           value={erp.address || ''}
//           onChange={(e) => setErp({ ...erp, address: e.target.value })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <TextField
//           fullWidth
//           label="Father's Name"
//           value={erp.fatherName || ''}
//           onChange={(e) => setErp({ ...erp, fatherName: e.target.value })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <TextField
//           fullWidth
//           label="Mother's Name"
//           value={erp.motherName || ''}
//           onChange={(e) => setErp({ ...erp, motherName: e.target.value })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//       <Grid item xs={12} md={4}>
//         <TextField
//           fullWidth
//           select
//           label="Blood Group"
//           value={erp.bloodGroup || ''}
//           onChange={(e) => setErp({ ...erp, bloodGroup: e.target.value })}
//           disabled={disabled}
//           required
//         >
//           {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
//             <MenuItem key={bg} value={bg}>{bg}</MenuItem>
//           ))}
//         </TextField>
//       </Grid>
//       <Grid item xs={12} md={4}>
//         <TextField
//           fullWidth
//           select
//           label="Category"
//           value={erp.category || ''}
//           onChange={(e) => setErp({ ...erp, category: e.target.value })}
//           disabled={disabled}
//           required
//         >
//           {['General', 'OBC', 'SC', 'ST', 'EWS'].map(cat => (
//             <MenuItem key={cat} value={cat}>{cat}</MenuItem>
//           ))}
//         </TextField>
//       </Grid>
//       <Grid item xs={12} md={4}>
//         <TextField
//           fullWidth
//           label="Religion"
//           value={erp.religion || ''}
//           onChange={(e) => setErp({ ...erp, religion: e.target.value })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//     </Grid>
//   );
// }

// function AcademicDetailsForm({ erp, setErp, disabled, addItem, removeItem, updateItem }) {
//   return (
//     <Grid container spacing={3}>
//       <Grid item xs={12} md={6}>
//         <TextField
//           fullWidth
//           label="Current Semester"
//           value={erp.currentSemester || ''}
//           onChange={(e) => setErp({ ...erp, currentSemester: e.target.value })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <TextField
//           fullWidth
//           label="Branch"
//           value={erp.branch || ''}
//           onChange={(e) => setErp({ ...erp, branch: e.target.value })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <TextField
//           fullWidth
//           label="Roll Number"
//           value={erp.rollNumber || ''}
//           onChange={(e) => setErp({ ...erp, rollNumber: e.target.value })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <TextField
//           fullWidth
//           label="CGPA"
//           type="number"
//           inputProps={{ min: 0, max: 10, step: 0.01 }}
//           value={erp.cgpa || ''}
//           onChange={(e) => setErp({ ...erp, cgpa: parseFloat(e.target.value) })}
//           disabled={disabled}
//           required
//         />
//       </Grid>
//       <Grid item xs={12}>
//         <Typography variant="h6" sx={{ mb: 2 }}>Semester Records</Typography>
//         {(erp.semesters || []).map((sem, index) => (
//           <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//             <Typography variant="subtitle1">Semester {index + 1}</Typography>
//             <TextField
//               fullWidth
//               label="SGPA"
//               type="number"
//               inputProps={{ min: 0, max: 10, step: 0.01 }}
//               value={sem.sgpa || ''}
//               onChange={(e) => updateItem('semesters', index, { ...sem, sgpa: parseFloat(e.target.value) })}
//               disabled={disabled}
//               sx={{ mt: 1 }}
//             />
//           </Box>
//         ))}
//         {!disabled && (
//           <Button
//             startIcon={<Add />}
//             onClick={() => addItem('semesters', { sgpa: 0, courses: [] })}
//             variant="outlined"
//           >
//             Add Semester
//           </Button>
//         )}
//       </Grid>
//     </Grid>
//   );
// }

// function TrainingDetailsForm({ erp, setErp, disabled, addItem, removeItem, updateItem }) {
//   return (
//     <Grid container spacing={3}>
//       <Grid item xs={12}>
//         <Typography variant="h6" sx={{ mb: 2 }}>Skills</Typography>
//         {(erp.skills || []).map((skill, index) => (
//           <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
//             <TextField
//               fullWidth
//               label="Skill"
//               value={skill}
//               onChange={(e) => updateItem('skills', index, e.target.value)}
//               disabled={disabled}
//             />
//             {!disabled && (
//               <IconButton onClick={() => removeItem('skills', index)}>
//                 <Delete />
//               </IconButton>
//             )}
//           </Box>
//         ))}
//         {!disabled && (
//           <Button
//             startIcon={<Add />}
//             onClick={() => addItem('skills', '')}
//             variant="outlined"
//             sx={{ mt: 1 }}
//           >
//             Add Skill
//           </Button>
//         )}
//       </Grid>

//       <Grid item xs={12}>
//         <Typography variant="h6" sx={{ mb: 2 }}>Projects</Typography>
//         {(erp.projects || []).map((project, index) => (
//           <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//             <TextField
//               fullWidth
//               label="Project Name"
//               value={project.name || ''}
//               onChange={(e) => updateItem('projects', index, { ...project, name: e.target.value })}
//               disabled={disabled}
//               sx={{ mb: 1 }}
//             />
//             <TextField
//               fullWidth
//               label="Description"
//               multiline
//               rows={2}
//               value={project.description || ''}
//               onChange={(e) => updateItem('projects', index, { ...project, description: e.target.value })}
//               disabled={disabled}
//             />
//             {!disabled && (
//               <IconButton onClick={() => removeItem('projects', index)} sx={{ mt: 1 }}>
//                 <Delete />
//               </IconButton>
//             )}
//           </Box>
//         ))}
//         {!disabled && (
//           <Button
//             startIcon={<Add />}
//             onClick={() => addItem('projects', { name: '', description: '' })}
//             variant="outlined"
//           >
//             Add Project
//           </Button>
//         )}
//       </Grid>
//     </Grid>
//   );
// }