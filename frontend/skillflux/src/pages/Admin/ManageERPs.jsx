import { useState, useEffect } from "react";
import {
  Container, Typography, Box, Card, Grid, Avatar, Chip,
  TextField, MenuItem, InputAdornment, IconButton, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import {
  FileText, Search, Filter, Download, ArrowLeft,
  GraduationCap, BookOpen, Award, CheckCircle, XCircle, Clock
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ManageERPs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [erps, setERPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedAcademicBatch, setSelectedAcademicBatch] = useState("All");
  const [selectedAdmissionYear, setSelectedAdmissionYear] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState(location.state?.filterStatus || "verified");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedERP, setSelectedERP] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [academicBatches, setAcademicBatches] = useState([]);
  const [admissionYears, setAdmissionYears] = useState([]);
  const [openFieldSelector, setOpenFieldSelector] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    // Basic Information
    studentName: true,
    rollNumber: true,
    email: true,
    department: true,
    year: true,
    academicBatch: true,
    // Personal Details
    phoneNumber: true,
    gender: false,
    dateOfBirth: false,
    bloodGroup: false,
    category: false,
    religion: false,
    nationality: false,
    aadhaarNumber: false,
    // Family Details
    fatherName: false,
    fatherPhone: false,
    fatherOccupation: false,
    motherName: false,
    motherPhone: false,
    motherOccupation: false,
    // Academic Performance
    currentSemester: true,
    currentYear: false,
    overallCGPA: true,
    totalSemesters: false,
    // Pre-BTech Education
    intermediatePercentage: false,
    intermediateBoard: false,
    intermediateCollegeName: false,
    intermediateYear: false,
    tenthPercentage: false,
    tenthBoard: false,
    tenthSchoolName: false,
    // Financial Information
    collegeTotalFee: false,
    universityScholarship: false,
    scholarshipBasis: false,
    scholarshipAmount: false,
    scholarshipPercentage: false,
    finalAmountToPay: false,
    externalScholarship: false,
    externalScholarshipName: false,
    externalScholarshipAmount: false,
    // Training & Development
    totalProjects: false,
    totalInternships: false,
    totalPlacements: false,
    totalResearchWorks: false,
    // Skills & Certifications
    totalCertifications: false,
    certificateURLs: false,
    technicalSkillsCount: false,
    softSkillsCount: false,
    // Accommodation
    accommodationType: false,
    address: false,
    // Status & Verification
    status: true,
    submittedAt: true,
    verifiedAt: false,
    adminNote: false,
    erpPoints: false,
    // Timestamps
    createdAt: false,
    updatedAt: false,
  });

  const departments = ["All", "CSE", "ECE", "Civil", "EEE", "Mechanical", "IT", "Chemical", "Biotech"];
  const years = ["All", "I", "II", "III", "IV"];
  const statuses = ["All", "draft", "submitted", "verified", "rejected"];

  // Define all available fields for CSV export
  const availableFields = [
    { key: 'studentName', label: 'Student Name', category: 'Basic Information' },
    { key: 'rollNumber', label: 'Roll Number', category: 'Basic Information' },
    { key: 'email', label: 'Email', category: 'Basic Information' },
    { key: 'department', label: 'Department', category: 'Basic Information' },
    { key: 'year', label: 'Year', category: 'Basic Information' },
    { key: 'academicBatch', label: 'Academic Batch', category: 'Basic Information' },
    { key: 'phoneNumber', label: 'Phone Number', category: 'Personal Details' },
    { key: 'gender', label: 'Gender', category: 'Personal Details' },
    { key: 'dateOfBirth', label: 'Date of Birth', category: 'Personal Details' },
    { key: 'bloodGroup', label: 'Blood Group', category: 'Personal Details' },
    { key: 'category', label: 'Category', category: 'Personal Details' },
    { key: 'religion', label: 'Religion', category: 'Personal Details' },
    { key: 'nationality', label: 'Nationality', category: 'Personal Details' },
    { key: 'aadhaarNumber', label: 'Aadhaar Number', category: 'Personal Details' },
    { key: 'fatherName', label: 'Father Name', category: 'Family Details' },
    { key: 'fatherPhone', label: 'Father Phone', category: 'Family Details' },
    { key: 'fatherOccupation', label: 'Father Occupation', category: 'Family Details' },
    { key: 'motherName', label: 'Mother Name', category: 'Family Details' },
    { key: 'motherPhone', label: 'Mother Phone', category: 'Family Details' },
    { key: 'motherOccupation', label: 'Mother Occupation', category: 'Family Details' },
    { key: 'currentSemester', label: 'Current Semester', category: 'Academic Performance' },
    { key: 'currentYear', label: 'Current Year', category: 'Academic Performance' },
    { key: 'overallCGPA', label: 'Overall CGPA', category: 'Academic Performance' },
    { key: 'totalSemesters', label: 'Total Semesters', category: 'Academic Performance' },
    { key: 'intermediatePercentage', label: 'Intermediate %', category: 'Pre-BTech Education' },
    { key: 'intermediateBoard', label: 'Intermediate Board', category: 'Pre-BTech Education' },
    { key: 'intermediateCollegeName', label: 'Intermediate College', category: 'Pre-BTech Education' },
    { key: 'intermediateYear', label: 'Intermediate Year', category: 'Pre-BTech Education' },
    { key: 'tenthPercentage', label: '10th %', category: 'Pre-BTech Education' },
    { key: 'tenthBoard', label: '10th Board', category: 'Pre-BTech Education' },
    { key: 'tenthSchoolName', label: '10th School', category: 'Pre-BTech Education' },
    { key: 'collegeTotalFee', label: 'College Total Fee', category: 'Financial Information' },
    { key: 'universityScholarship', label: 'University Scholarship', category: 'Financial Information' },
    { key: 'scholarshipBasis', label: 'Scholarship Basis', category: 'Financial Information' },
    { key: 'scholarshipAmount', label: 'Scholarship Amount', category: 'Financial Information' },
    { key: 'scholarshipPercentage', label: 'Scholarship %', category: 'Financial Information' },
    { key: 'finalAmountToPay', label: 'Final Amount to Pay', category: 'Financial Information' },
    { key: 'externalScholarship', label: 'External Scholarship', category: 'Financial Information' },
    { key: 'externalScholarshipName', label: 'External Scholarship Name', category: 'Financial Information' },
    { key: 'externalScholarshipAmount', label: 'External Scholarship Amount', category: 'Financial Information' },
    { key: 'totalProjects', label: 'Total Projects', category: 'Training & Development' },
    { key: 'totalInternships', label: 'Total Internships', category: 'Training & Development' },
    { key: 'totalPlacements', label: 'Total Placements', category: 'Training & Development' },
    { key: 'totalResearchWorks', label: 'Total Research Works', category: 'Training & Development' },
    { key: 'totalCertifications', label: 'Total Certifications', category: 'Skills & Certifications' },
    { key: 'certificateURLs', label: 'Certificate URLs', category: 'Skills & Certifications' },
    { key: 'technicalSkillsCount', label: 'Technical Skills Count', category: 'Skills & Certifications' },
    { key: 'softSkillsCount', label: 'Soft Skills Count', category: 'Skills & Certifications' },
    { key: 'accommodationType', label: 'Accommodation Type', category: 'Accommodation' },
    { key: 'address', label: 'Address', category: 'Accommodation' },
    { key: 'status', label: 'ERP Status', category: 'Status & Verification' },
    { key: 'submittedAt', label: 'Submitted At', category: 'Status & Verification' },
    { key: 'verifiedAt', label: 'Verified At', category: 'Status & Verification' },
    { key: 'adminNote', label: 'Admin Note', category: 'Status & Verification' },
    { key: 'erpPoints', label: 'ERP Points', category: 'Status & Verification' },
    { key: 'createdAt', label: 'Created At', category: 'Timestamps' },
    { key: 'updatedAt', label: 'Updated At', category: 'Timestamps' },
  ];

  useEffect(() => {
    fetchERPs();
  }, [selectedAcademicBatch, selectedAdmissionYear, selectedStatus, selectedDepartment, selectedYear]);

  const fetchERPs = async () => {
    try {
      setLoading(true);
      console.log("Fetching ERPs from /admin/erps...");

      const params = new URLSearchParams();
      if (selectedAcademicBatch !== "All") params.append('academicBatch', selectedAcademicBatch);
      if (selectedAdmissionYear !== "All") params.append('admissionYear', selectedAdmissionYear);
      if (selectedStatus !== "All") params.append('status', selectedStatus);
      if (selectedDepartment !== "All") params.append('department', selectedDepartment);
      if (selectedYear !== "All") params.append('year', selectedYear);

      const queryString = params.toString();
      const url = `/admin/erps${queryString ? `?${queryString}` : ''}`;

      const res = await axios.get(url);
      console.log("Fetched ERPs successfully:", res.data);

      const erpsData = res.data.erps || [];
      const filterOptions = res.data.filterOptions || {};

      setERPs(erpsData);

      if (selectedAcademicBatch === "All" && selectedAdmissionYear === "All") {
        setAcademicBatches(filterOptions.academicBatches || []);
        setAdmissionYears(filterOptions.admissionYears || []);
      }

      if (erpsData.length === 0) {
        toast.info("No ERPs found for the selected filters");
      }
    } catch (err) {
      console.error("Failed to fetch ERPs:", err);
      toast.error("Failed to load ERPs: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredERPs = erps.filter(erp => {
    if (!erp.student) return false;

    const matchesSearch =
      erp.student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      erp.student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      erp.student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      erp.student.academicBatch?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const erpsByDepartment = departments
    .filter(dept => dept !== "All")
    .map(dept => ({
      department: dept,
      count: erps.filter(e => e.student?.department === dept).length
    }));

  const handleOpenFieldSelector = () => {
    setOpenFieldSelector(true);
  };

  const handleCloseFieldSelector = () => {
    setOpenFieldSelector(false);
  };

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const handleSelectAllFields = () => {
    const allSelected = {};
    availableFields.forEach(field => {
      allSelected[field.key] = true;
    });
    setSelectedFields(allSelected);
  };

  const handleDeselectAllFields = () => {
    const allDeselected = {};
    availableFields.forEach(field => {
      allDeselected[field.key] = false;
    });
    setSelectedFields(allDeselected);
  };

  const handleSelectCategory = (category) => {
    const updated = { ...selectedFields };
    availableFields
      .filter(field => field.category === category)
      .forEach(field => {
        updated[field.key] = true;
      });
    setSelectedFields(updated);
  };

  const getFieldValue = (erp, fieldKey) => {
    const fieldMap = {
      studentName: erp.student?.name || '',
      rollNumber: erp.student?.rollNumber || '',
      email: erp.email || erp.student?.email || '',
      department: erp.student?.department || '',
      year: erp.student?.year || '',
      academicBatch: erp.student?.academicBatch || erp.academicBatch || '',
      phoneNumber: erp.phoneNumber || '',
      gender: erp.gender || '',
      dateOfBirth: erp.dateOfBirth ? new Date(erp.dateOfBirth).toLocaleDateString() : '',
      bloodGroup: erp.bloodGroup || '',
      category: erp.category || '',
      religion: erp.religion || '',
      nationality: erp.nationality || '',
      aadhaarNumber: erp.aadhaarNumber || '',
      fatherName: erp.fatherName || '',
      fatherPhone: erp.fatherPhone || '',
      fatherOccupation: erp.fatherOccupation || '',
      motherName: erp.motherName || '',
      motherPhone: erp.motherPhone || '',
      motherOccupation: erp.motherOccupation || '',
      currentSemester: erp.currentSemester || '',
      currentYear: erp.currentYear || '',
      overallCGPA: erp.overallCGPA || '',
      totalSemesters: erp.semesters?.length || 0,
      intermediatePercentage: erp.intermediatePercentage || '',
      intermediateBoard: erp.intermediateBoard || '',
      intermediateCollegeName: erp.intermediateCollegeName || '',
      intermediateYear: erp.intermediateYear || '',
      tenthPercentage: erp.tenthPercentage || '',
      tenthBoard: erp.tenthBoard || '',
      tenthSchoolName: erp.tenthSchoolName || '',
      collegeTotalFee: erp.collegeTotalFee || '',
      universityScholarship: erp.universityScholarship ? 'Yes' : 'No',
      scholarshipBasis: erp.scholarshipBasis || '',
      scholarshipAmount: erp.scholarshipAmount || '',
      scholarshipPercentage: erp.scholarshipPercentage || '',
      finalAmountToPay: erp.finalAmountToPay || '',
      externalScholarship: erp.externalScholarship ? 'Yes' : 'No',
      externalScholarshipName: erp.externalScholarshipName || '',
      externalScholarshipAmount: erp.externalScholarshipAmount || '',
      totalProjects: erp.projects?.length || 0,
      totalInternships: erp.internships?.length || 0,
      totalPlacements: erp.placements?.length || 0,
      totalResearchWorks: erp.researchWorks?.length || 0,
      totalCertifications: erp.certifications?.length || 0,
      certificateURLs: erp.certifications?.map(cert => cert.certificateUrl).filter(url => url).join('; ') || 'N/A',
      technicalSkillsCount: erp.technicalSkills?.length || 0,
      softSkillsCount: erp.softSkills?.length || 0,
      accommodationType: erp.accommodationType || '',
      address: erp.address || '',
      status: erp.status || '',
      submittedAt: erp.submittedAt ? new Date(erp.submittedAt).toLocaleDateString() : '',
      verifiedAt: erp.verifiedAt ? new Date(erp.verifiedAt).toLocaleDateString() : '',
      adminNote: erp.adminNote || '',
      erpPoints: erp.erpPoints || 0,
      createdAt: erp.createdAt ? new Date(erp.createdAt).toLocaleString() : '',
      updatedAt: erp.updatedAt ? new Date(erp.updatedAt).toLocaleString() : '',
    };

    return fieldMap[fieldKey];
  };

  const handleExportCSV = () => {
    const selectedFieldsList = availableFields.filter(field => selectedFields[field.key]);

    if (selectedFieldsList.length === 0) {
      toast.error("Please select at least one field to export");
      return;
    }

    const escapeCSVValue = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = selectedFieldsList.map(field => escapeCSVValue(field.label));

    const dataRows = filteredERPs.map(erp => {
      return selectedFieldsList.map(field => escapeCSVValue(getFieldValue(erp, field.key)));
    });

    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erps_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredERPs.length} ERPs with ${selectedFieldsList.length} fields`);
    handleCloseFieldSelector();
  };

  const handleViewERP = async (erp) => {
    try {
      const res = await axios.get(`/admin/erps/${erp._id}`);
      setSelectedERP(res.data);
      setOpenDialog(true);
    } catch (err) {
      console.error("Failed to fetch ERP details:", err);
      toast.error("Failed to load ERP details");
    }
  };

  const handleVerifyERP = async (erpId, status, adminNote = "") => {
    try {
      await axios.put(`/admin/erps/${erpId}/verify`, { status, adminNote });
      toast.success(`ERP ${status} successfully`);
      setOpenDialog(false);
      fetchERPs();
    } catch (err) {
      toast.error("Failed to verify ERP: " + (err.response?.data?.message || err.message));
    }
  };

  const clearAllFilters = () => {
    setSelectedDepartment("All");
    setSelectedYear("All");
    setSelectedAcademicBatch("All");
    setSelectedAdmissionYear("All");
    setSelectedStatus("All");
    setSearchQuery("");
    toast.info("All filters cleared");
    fetchERPs();
  };

  const hasActiveFilters = () => {
    return selectedDepartment !== "All" ||
      selectedYear !== "All" ||
      selectedAcademicBatch !== "All" ||
      selectedAdmissionYear !== "All" ||
      selectedStatus !== "All" ||
      searchQuery !== "";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#10B981';
      case 'submitted': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Container maxWidth="xl" className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <Box className="flex items-center gap-4">
              <IconButton
                onClick={() => navigate('/admin')}
                sx={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  '&:hover': { backgroundColor: '#F9FAFB' }
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </IconButton>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    color: '#1F2937',
                    mb: 0.5
                  }}
                >
                  Student ERPs
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  Total {erps.length} ERP records
                </Typography>
              </Box>
            </Box>

            <Box className="flex gap-2 mt-4 md:mt-0">
              {hasActiveFilters() && (
                <Button
                  variant="outlined"
                  startIcon={<Filter className="w-4 h-4" />}
                  onClick={clearAllFilters}
                  sx={{
                    borderColor: '#6366F1',
                    color: '#6366F1',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#4F46E5',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)'
                    }
                  }}
                >
                  Clear All Filters
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Download className="w-4 h-4" />}
                onClick={handleOpenFieldSelector}
                disabled={filteredERPs.length === 0}
                sx={{
                  backgroundColor: '#10B981',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#059669'
                  }
                }}
              >
                Download CSV ({filteredERPs.length})
              </Button>
            </Box>
          </Box>

          {/* Department Statistics */}
          <Grid container spacing={3} className="mb-6">
            {erpsByDepartment.map((dept, index) => (
              <Grid item xs={6} sm={4} md={3} lg={1.5} key={dept.department}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    elevation={0}
                    onClick={() => setSelectedDepartment(dept.department)}
                    sx={{
                      p: 2,
                      backgroundColor: selectedDepartment === dept.department ? '#6366F1' : 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        borderColor: '#6366F1'
                      }
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: selectedDepartment === dept.department ? 'white' : '#1F2937',
                        mb: 0.5
                      }}
                    >
                      {dept.count}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: selectedDepartment === dept.department ? 'rgba(255,255,255,0.9)' : '#6B7280',
                        fontSize: '0.75rem'
                      }}
                    >
                      {dept.department}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Filters */}
          <Card
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px'
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#6B7280', fontStyle: 'italic' }}>
                💡 <strong>Filter Guide:</strong> Start with Academic Batch or Status to filter ERP records, then narrow down by Year, Department for precise results.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, roll number, or academic year"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search className="w-5 h-5 text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Academic Batch"
                  value={selectedAcademicBatch}
                  onChange={(e) => setSelectedAcademicBatch(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                >
                  <MenuItem value="All">All Batches</MenuItem>
                  {academicBatches.map((batch) => (
                    <MenuItem key={batch} value={batch}>{batch}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={1.5}>
                <TextField
                  fullWidth
                  select
                  label="Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>{year === "All" ? "All Years" : year}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept === "All" ? "All Departments" : dept}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={1.5}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status === "All" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={2}>
                <Box className="flex gap-2">
                  <Button
                    fullWidth
                    variant={viewMode === "grid" ? "contained" : "outlined"}
                    onClick={() => setViewMode("grid")}
                    sx={{
                      textTransform: 'none',
                      backgroundColor: viewMode === "grid" ? '#6366F1' : 'transparent',
                      borderColor: '#E5E7EB',
                      color: viewMode === "grid" ? 'white' : '#6B7280',
                      '&:hover': {
                        backgroundColor: viewMode === "grid" ? '#4F46E5' : 'rgba(99, 102, 241, 0.05)'
                      }
                    }}
                  >
                    Grid
                  </Button>
                  <Button
                    fullWidth
                    variant={viewMode === "table" ? "contained" : "outlined"}
                    onClick={() => setViewMode("table")}
                    sx={{
                      textTransform: 'none',
                      backgroundColor: viewMode === "table" ? '#6366F1' : 'transparent',
                      borderColor: '#E5E7EB',
                      color: viewMode === "table" ? 'white' : '#6B7280',
                      '&:hover': {
                        backgroundColor: viewMode === "table" ? '#4F46E5' : 'rgba(99, 102, 241, 0.05)'
                      }
                    }}
                  >
                    Table
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* ERPs Display */}
          {loading ? (
            <Typography>Loading...</Typography>
          ) : filteredERPs.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                p: 8,
                textAlign: 'center',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px'
              }}
            >
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                No ERPs found
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Try adjusting your filters or search query
              </Typography>
            </Card>
          ) : viewMode === "grid" ? (
            <Grid container spacing={3}>
              {filteredERPs.map((erp, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={erp._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      elevation={0}
                      onClick={() => handleViewERP(erp)}
                      sx={{
                        p: 3,
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          borderColor: '#6366F1'
                        }
                      }}
                    >
                      <Box className="flex flex-col items-center mb-3">
                        <Avatar
                          sx={{
                            width: 70,
                            height: 70,
                            backgroundColor: '#6366F1',
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            mb: 2
                          }}
                        >
                          {erp.student?.name?.[0] || 'S'}
                        </Avatar>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#1F2937',
                            textAlign: 'center',
                            mb: 0.5
                          }}
                        >
                          {erp.student?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                          {erp.student?.rollNumber || 'N/A'}
                        </Typography>
                      </Box>

                      <Box className="space-y-2 mb-3">
                        <Box className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            {erp.student?.department || 'N/A'} - Year {erp.student?.year || 'N/A'}
                          </Typography>
                        </Box>
                        {erp.student?.academicBatch && (
                          <Box className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-400" />
                            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                              Batch {erp.student.academicBatch}
                            </Typography>
                          </Box>
                        )}
                        <Box className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            Semester: {erp.currentSemester || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <Box className="text-center">
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366F1' }}>
                            {erp.cgpa ? erp.cgpa.toFixed(2) : 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            CGPA
                          </Typography>
                        </Box>
                        <Chip
                          icon={getStatusIcon(erp.status)}
                          label={erp.status?.toUpperCase() || 'DRAFT'}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(erp.status),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: '1px solid #E5E7EB',
                borderRadius: '12px'
              }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Roll Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Year</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Academic Batch</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>CGPA</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredERPs.map((erp) => (
                    <TableRow
                      key={erp._id}
                      onClick={() => handleViewERP(erp)}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#F9FAFB',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <TableCell>
                        <Box className="flex items-center gap-3">
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#6366F1'
                            }}
                          >
                            {erp.student?.name?.[0] || 'S'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                            {erp.student?.name || 'Unknown'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {erp.student?.rollNumber || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={erp.student?.department || 'N/A'}
                          size="small"
                          sx={{
                            backgroundColor: '#6366F1',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {erp.student?.year || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={erp.student?.academicBatch || 'N/A'}
                          size="small"
                          sx={{
                            backgroundColor: '#EEF2FF',
                            color: '#6366F1',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {erp.currentSemester || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#6366F1' }}>
                          {erp.cgpa ? erp.cgpa.toFixed(2) : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(erp.status)}
                          label={erp.status?.toUpperCase() || 'DRAFT'}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(erp.status),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ERP Detail Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="lg"
            fullWidth
            sx={{ '& .MuiDialog-paper': { maxHeight: '90vh' } }}
          >
            <DialogTitle sx={{
              backgroundColor: '#6366F1',
              color: 'white',
              fontWeight: 600
            }}>
              Complete ERP Details
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {selectedERP && (
                <Box>
                  {/* Student Header */}
                  <Box className="flex items-start gap-4 mb-4">
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        backgroundColor: '#6366F1',
                        fontSize: '2.5rem',
                        fontWeight: 700
                      }}
                    >
                      {selectedERP.student?.name?.[0] || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
                        {selectedERP.student?.name || 'Unknown Student'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Roll Number:</strong> {selectedERP.student?.rollNumber || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Email:</strong> {selectedERP.email || selectedERP.student?.email || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Phone:</strong> {selectedERP.phoneNumber || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Department:</strong> {selectedERP.student?.department || 'N/A'} | <strong>Year:</strong> {selectedERP.student?.year || 'N/A'}
                      </Typography>
                      {selectedERP.student?.academicBatch && (
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Academic Batch:</strong> {selectedERP.student.academicBatch}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Quick Stats */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <Card elevation={0} sx={{ p: 2, backgroundColor: '#EEF2FF', textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#6366F1', mb: 1 }}>Current Semester</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#6366F1' }}>
                          {selectedERP.currentSemester || 'N/A'}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card elevation={0} sx={{ p: 2, backgroundColor: '#D1FAE5', textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#059669', mb: 1 }}>Overall CGPA</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#059669' }}>
                          {selectedERP.overallCGPA ? selectedERP.overallCGPA.toFixed(2) : 'N/A'}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card elevation={0} sx={{ p: 2, backgroundColor: '#FEF3C7', textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#D97706', mb: 1 }}>Status</Typography>
                        <Chip
                          icon={getStatusIcon(selectedERP.status)}
                          label={selectedERP.status?.toUpperCase() || 'DRAFT'}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(selectedERP.status),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card elevation={0} sx={{ p: 2, backgroundColor: '#E0E7FF', textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#4F46E5', mb: 1 }}>Semesters</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#4F46E5' }}>
                          {selectedERP.semesters?.length || 0}
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Personal Information */}
                  <Card elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#F9FAFB' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
                      📋 Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Full Name:</strong> {selectedERP.fullName || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Gender:</strong> {selectedERP.gender || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Blood Group:</strong> {selectedERP.bloodGroup || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Category:</strong> {selectedERP.category || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Address:</strong> {selectedERP.address || selectedERP.permanentAddress?.street || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>

                  {/* Family Information */}
                  <Card elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#F9FAFB' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
                      👨‍👩‍👦 Family Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Father's Name:</strong> {selectedERP.fatherName || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Father's Phone:</strong> {selectedERP.fatherPhone || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Mother's Name:</strong> {selectedERP.motherName || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Mother's Phone:</strong> {selectedERP.motherPhone || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>

                  {/* Academic Background */}
                  <Card elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#F9FAFB' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
                      🎓 Academic Background
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>10th Percentage:</strong> {selectedERP.tenthPercentage || 'N/A'}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>10th Board:</strong> {selectedERP.tenthBoard || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Intermediate %:</strong> {selectedERP.intermediatePercentage || 'N/A'}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Intermediate Board:</strong> {selectedERP.intermediateBoard || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>

                  {/* Scholarship Information */}
                  {(selectedERP.universityScholarship || selectedERP.scholarshipAvailed) && (
                    <Card elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#FEF3C7' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#92400E', mb: 2 }}>
                        💰 Scholarship Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: '#92400E' }}>
                            <strong>Scholarship Type:</strong> {selectedERP.scholarshipBasis || selectedERP.scholarshipName || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: '#92400E' }}>
                            <strong>Amount:</strong> ₹{selectedERP.scholarshipAmount || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Card>
                  )}

                  {/* Semester Details */}
                  {selectedERP.semesters && selectedERP.semesters.length > 0 && (
                    <Card elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#F9FAFB' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
                        📚 Semester Details
                      </Typography>
                      {selectedERP.semesters.map((sem, idx) => (
                        <Box key={idx} sx={{ mb: 2, p: 2, backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#6366F1', mb: 1 }}>
                            Semester {sem.semesterName} | SGPA: {sem.sgpa || 'N/A'}
                          </Typography>
                          {sem.courses && sem.courses.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Courses:</Typography>
                              {sem.courses.map((course, cIdx) => (
                                <Typography key={cIdx} variant="body2" sx={{ color: '#6B7280', ml: 2 }}>
                                  • {course.courseName} - Grade: {course.grade || 'N/A'} (GPA: {course.gpa || 'N/A'})
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Card>
                  )}

                  {/* Projects */}
                  {selectedERP.projects && selectedERP.projects.length > 0 && (
                    <Card elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#F9FAFB' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
                        💻 Projects
                      </Typography>
                      {selectedERP.projects.map((proj, idx) => (
                        <Box key={idx} sx={{ mb: 2, p: 2, backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6366F1' }}>
                            {proj.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                            {proj.description || 'No description'}
                          </Typography>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {proj.technologies.map((tech, tIdx) => (
                                <Chip key={tIdx} label={tech} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Card>
                  )}

                  {/* Internships */}
                  {selectedERP.internships && selectedERP.internships.length > 0 && (
                    <Card elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#F9FAFB' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
                        🏢 Internships
                      </Typography>
                      {selectedERP.internships.map((intern, idx) => (
                        <Box key={idx} sx={{ mb: 2, p: 2, backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6366F1' }}>
                            {intern.company} - {intern.role}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                            Duration: {intern.duration || 'N/A'} | Stipend: {intern.stipend || 'N/A'}
                          </Typography>
                        </Box>
                      ))}
                    </Card>
                  )}

                  {selectedERP.adminNote && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
                      <Typography variant="body2" sx={{ color: '#92400E', fontWeight: 600 }}>
                        Admin Note: {selectedERP.adminNote}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              {selectedERP?.status === 'submitted' && (
                <>
                  <Button
                    onClick={() => {
                      const note = prompt("Enter admin note (optional):");
                      handleVerifyERP(selectedERP._id, 'verified', note || '');
                    }}
                    variant="contained"
                    sx={{
                      backgroundColor: '#10B981',
                      '&:hover': { backgroundColor: '#059669' }
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => {
                      const note = prompt("Enter rejection reason:");
                      if (note) handleVerifyERP(selectedERP._id, 'rejected', note);
                    }}
                    variant="contained"
                    sx={{
                      backgroundColor: '#EF4444',
                      '&:hover': { backgroundColor: '#DC2626' }
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button
                onClick={() => setOpenDialog(false)}
                variant="outlined"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        
          {/* Field Selector Dialog */}
          <Dialog
            open={openFieldSelector}
            onClose={handleCloseFieldSelector}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ backgroundColor: '#6366F1', color: 'white', fontWeight: 600 }}>
              Select Fields to Export
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Choose which fields you want to include in the CSV export. Selected fields: {Object.values(selectedFields).filter(Boolean).length}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Button size="small" variant="outlined" onClick={handleSelectAllFields} sx={{ textTransform: 'none' }}>Select All</Button>
                  <Button size="small" variant="outlined" onClick={handleDeselectAllFields} sx={{ textTransform: 'none' }}>Deselect All</Button>
                </Box>
              </Box>
              {['Basic Information', 'Personal Details', 'Family Details', 'Academic Performance', 'Pre-BTech Education', 'Financial Information', 'Training & Development', 'Skills & Certifications', 'Accommodation', 'Status & Verification', 'Timestamps'].map(category => {
                const categoryFields = availableFields.filter(f => f.category === category);
                return (<Box key={category} sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#6366F1' }}>{category}</Typography><Grid container spacing={1}>{categoryFields.map(field => (<Grid item xs={6} sm={4} md={3} key={field.key}><Box onClick={() => handleFieldToggle(field.key)} sx={{ p: 1, border: '1px solid #E5E7EB', borderRadius: 1, cursor: 'pointer', backgroundColor: selectedFields[field.key] ? '#EEF2FF' : 'white', borderColor: selectedFields[field.key] ? '#6366F1' : '#E5E7EB', '&:hover': { backgroundColor: selectedFields[field.key] ? '#E0E7FF' : '#F9FAFB' }, transition: 'all 0.2s' }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 16, height: 16, border: '2px solid', borderColor: selectedFields[field.key] ? '#6366F1' : '#D1D5DB', borderRadius: '4px', backgroundColor: selectedFields[field.key] ? '#6366F1' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{selectedFields[field.key] && (<CheckCircle sx={{ width: 12, height: 12, color: 'white' }} />)}</Box><Typography variant="body2" sx={{ fontSize: '0.875rem', color: selectedFields[field.key] ? '#6366F1' : '#6B7280', fontWeight: selectedFields[field.key] ? 600 : 400 }}>{field.label}</Typography></Box></Box></Grid>))}</Grid></Box>);
              })}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={handleCloseFieldSelector} variant="outlined">Cancel</Button>
              <Button onClick={handleExportCSV} variant="contained" startIcon={<Download className="w-4 h-4" />} disabled={Object.values(selectedFields).filter(Boolean).length === 0} sx={{ backgroundColor: '#10B981', '&:hover': { backgroundColor: '#059669' } }}>Download CSV ({Object.values(selectedFields).filter(Boolean).length} fields)</Button>
            </DialogActions>
          </Dialog>
</motion.div>
      </Container>
    </Box>
  );
}

