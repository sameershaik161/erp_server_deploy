import { useState, useEffect } from "react";
import {
  Container, Typography, Box, Card, Grid, Avatar, Chip,
  TextField, MenuItem, InputAdornment, IconButton, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tabs, Tab, Skeleton, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, List, ListItem, ListItemText, Checkbox, FormControlLabel, FormGroup
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import {
  Users, Search, Filter, Download, Mail, Phone,
  Award, TrendingUp, ArrowLeft, BookOpen, GraduationCap, FileSpreadsheet
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getFileUrl } from "../../config/api";

export default function Students() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSubmissionYear, setSelectedSubmissionYear] = useState("All");
  const [selectedAcademicBatch, setSelectedAcademicBatch] = useState("All");
  const [selectedAdmissionYear, setSelectedAdmissionYear] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or table
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterType, setFilterType] = useState(location.state?.filterType || null);
  const [achievementCategoryFilter, setAchievementCategoryFilter] = useState("All");
  const [mainCategoryFilter, setMainCategoryFilter] = useState("All"); // For main page filter
  const [academicBatches, setAcademicBatches] = useState([]);
  const [admissionYears, setAdmissionYears] = useState([]);
  const [openFieldSelector, setOpenFieldSelector] = useState(false);

  // Determine initial field selection based on filter type
  const getInitialSelectedFields = () => {
    const isAchievementView = location.state?.filterType === 'withAchievements';

    return {
      // Basic Information
      name: true,
      rollNumber: true,
      email: true,
      department: true,
      section: true,
      year: true,
      // Academic Details
      academicBatch: true,
      admissionYear: true,
      graduationYear: true,
      // Performance Metrics
      totalPoints: true,
      totalAchievements: true,
      approvedAchievements: true,
      pendingAchievements: true,
      rejectedAchievements: true,
      // ERP Personal Data
      phoneNumber: true,
      gender: true,
      dateOfBirth: true,
      bloodGroup: true,
      // ERP Academic Data
      currentSemester: true,
      overallCGPA: true,
      erpStatus: true,
      // Family Details
      fatherName: true,
      motherName: true,
      // Other Details
      accommodationType: true,
      address: true,
      // Profile Assets
      profilePicUrl: true,
      bannerUrl: true,
      resumeUrl: true,
      // Social Links
      linkedin: true,
      github: true,
      leetcode: true,
      codechef: true,
      portfolio: true,
      // Timestamps
      createdAt: true,
      updatedAt: true,
      // Achievements - Enable all if viewing achievements page
      achievementDetails: isAchievementView,
      achievementTitles: isAchievementView,
      achievementCategories: isAchievementView,
      achievementPoints: isAchievementView,
      achievementCertificateUrls: true,  // Always true for certificate URLs
      achievementStatuses: isAchievementView,
    };
  };

  const [selectedFields, setSelectedFields] = useState(getInitialSelectedFields());

  const achievementCategories = [
    "All",
    "Academic Certifications",
    "Sports Competition Certification",
    "Cultural Certification",
    "Co-ordinator Certificates"
  ];

  const departments = ["All", "CSE", "ECE", "Civil", "EEE", "Mechanical", "IT", "Chemical", "Biotech"];
  const sections = ["All", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S"];
  const years = ["All", "I", "II", "III", "IV"];

  const submissionYears = [
    "All",
    ...Array.from(
      new Set(
        students
          .flatMap(s => s.achievements || [])
          .map(a => a?.createdAt)
          .filter(Boolean)
          .map(d => new Date(d).getFullYear())
      )
    )
      .filter(y => Number.isFinite(y))
      .sort((a, b) => b - a)
      .map(y => String(y))
  ];

  // Define all available fields for CSV export
  const availableFields = [
    { key: 'name', label: 'Name', category: 'Basic Information' },
    { key: 'rollNumber', label: 'Roll Number', category: 'Basic Information' },
    { key: 'email', label: 'Email', category: 'Basic Information' },
    { key: 'department', label: 'Department', category: 'Basic Information' },
    { key: 'section', label: 'Section', category: 'Basic Information' },
    { key: 'year', label: 'Year', category: 'Basic Information' },
    { key: 'academicBatch', label: 'Academic Batch', category: 'Academic Details' },
    { key: 'admissionYear', label: 'Admission Year', category: 'Academic Details' },
    { key: 'graduationYear', label: 'Graduation Year', category: 'Academic Details' },
    { key: 'totalPoints', label: 'Total Points', category: 'Performance Metrics' },
    { key: 'totalAchievements', label: 'Total Achievements', category: 'Performance Metrics' },
    { key: 'approvedAchievements', label: 'Approved Achievements', category: 'Performance Metrics' },
    { key: 'pendingAchievements', label: 'Pending Achievements', category: 'Performance Metrics' },
    { key: 'rejectedAchievements', label: 'Rejected Achievements', category: 'Performance Metrics' },
    { key: 'phoneNumber', label: 'Phone Number', category: 'ERP Personal Data' },
    { key: 'gender', label: 'Gender', category: 'ERP Personal Data' },
    { key: 'dateOfBirth', label: 'Date of Birth', category: 'ERP Personal Data' },
    { key: 'bloodGroup', label: 'Blood Group', category: 'ERP Personal Data' },
    { key: 'currentSemester', label: 'Current Semester', category: 'ERP Academic Data' },
    { key: 'overallCGPA', label: 'Overall CGPA', category: 'ERP Academic Data' },
    { key: 'erpStatus', label: 'ERP Status', category: 'ERP Academic Data' },
    { key: 'fatherName', label: 'Father Name', category: 'Family Details' },
    { key: 'motherName', label: 'Mother Name', category: 'Family Details' },
    { key: 'accommodationType', label: 'Accommodation Type', category: 'Other Details' },
    { key: 'address', label: 'Address', category: 'Other Details' },
    { key: 'profilePicUrl', label: 'Profile Picture URL', category: 'Profile Assets' },
    { key: 'bannerUrl', label: 'Banner URL', category: 'Profile Assets' },
    { key: 'resumeUrl', label: 'Resume URL', category: 'Profile Assets' },
    { key: 'linkedin', label: 'LinkedIn', category: 'Social Links' },
    { key: 'github', label: 'GitHub', category: 'Social Links' },
    { key: 'leetcode', label: 'LeetCode', category: 'Social Links' },
    { key: 'codechef', label: 'CodeChef', category: 'Social Links' },
    { key: 'portfolio', label: 'Portfolio', category: 'Social Links' },
    { key: 'createdAt', label: 'Created At', category: 'Timestamps' },
    { key: 'updatedAt', label: 'Updated At', category: 'Timestamps' },
    { key: 'achievementDetails', label: 'Achievement Details (All)', category: 'Achievements' },
    { key: 'achievementTitles', label: 'Achievement Titles', category: 'Achievements' },
    { key: 'achievementCategories', label: 'Achievement Categories', category: 'Achievements' },
    { key: 'achievementPoints', label: 'Achievement Points', category: 'Achievements' },
    { key: 'achievementCertificateUrls', label: 'Certificate URLs', category: 'Achievements' },
    { key: 'achievementStatuses', label: 'Achievement Statuses', category: 'Achievements' },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (academicBatches.length > 0) {
      fetchStudents();
    }
  }, [selectedAcademicBatch, selectedAdmissionYear]); // Refetch when academic filters change

  // Update selected fields when filterType changes
  useEffect(() => {
    if (filterType === 'withAchievements') {
      setSelectedFields(prev => ({
        ...prev,
        achievementDetails: true,
        achievementTitles: true,
        achievementCategories: true,
        achievementPoints: true,
        achievementCertificateUrls: true,
        achievementStatuses: true,
      }));
    }
  }, [filterType]);

  // Fetch initial filter options
  const fetchInitialData = async () => {
    try {
      console.log("Fetching initial filter options...");
      const res = await axios.get("/admin/students");
      const filterOptions = res.data.filterOptions || {};

      setAcademicBatches(filterOptions.academicBatches || []);
      setAdmissionYears(filterOptions.admissionYears || []);

      // Fetch students after getting filter options
      await fetchStudents();
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      toast.error("Failed to load filter options");
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log("Fetching students from /admin/students...");

      // Build query parameters for filtering
      const params = new URLSearchParams();
      if (selectedAcademicBatch !== "All") {
        params.append('academicBatch', selectedAcademicBatch);
      }
      if (selectedAdmissionYear !== "All") {
        params.append('admissionYear', selectedAdmissionYear);
      }

      const queryString = params.toString();
      const url = `/admin/students${queryString ? `?${queryString}` : ''}`;

      const res = await axios.get(url);
      console.log("Fetched students successfully:", res.data);

      const studentsData = res.data.students || [];
      const filterOptions = res.data.filterOptions || {};

      console.log("Number of students:", studentsData.length);
      console.log("Filter options:", filterOptions);

      // Set default department for students without one
      const normalizedStudents = studentsData.map(s => ({
        ...s,
        department: s.department || "CSE", // Default to CSE if no department
        achievements: s.achievements || []
      }));

      setStudents(normalizedStudents);

      // Only update filter options if we're getting all students (no filters applied)
      if (selectedAcademicBatch === "All" && selectedAdmissionYear === "All") {
        setAcademicBatches(filterOptions.academicBatches || []);
        setAdmissionYears(filterOptions.admissionYears || []);
      }

      if (normalizedStudents.length === 0) {
        toast.info("No students found for the selected filters");
      }
    } catch (err) {
      console.error("Failed to fetch students - Full error:", err);
      const errorMsg = err.response?.status === 404
        ? "Students endpoint not found. Please restart the backend server."
        : err.response?.status === 401
          ? "Unauthorized. Please login again."
          : err.response?.data?.message || err.message;

      toast.error("Failed to load students: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Filter students by department, section, year, academic year, search query, achievement status, and category
  const filteredStudents = students.filter(student => {
    const matchesDepartment = selectedDepartment === "All" || student.department === selectedDepartment;
    const matchesSection = selectedSection === "All" || student.section === selectedSection;
    const matchesYear = selectedYear === "All" || student.year === selectedYear;
    const matchesAcademicBatch = selectedAcademicBatch === "All" || student.academicBatch === selectedAcademicBatch;
    const matchesAdmissionYear = selectedAdmissionYear === "All" || student.admissionYear?.toString() === selectedAdmissionYear;
    const matchesSearch =
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.academicBatch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionYear?.toString().includes(searchQuery);
    const matchesAchievementFilter = filterType === 'withAchievements'
      ? (student.achievements && student.achievements.filter(a => a.status === 'approved').length > 0)
      : true;

    const achievementsForSubmissionYear = (filterType === 'withAchievements'
      ? (student.achievements || []).filter(a => a.status === 'approved')
      : (student.achievements || [])
    ).filter(a => {
      if (selectedSubmissionYear === "All") return true;
      if (!a?.createdAt) return false;
      return String(new Date(a.createdAt).getFullYear()) === selectedSubmissionYear;
    });

    const matchesSubmissionYear = selectedSubmissionYear === "All"
      ? true
      : achievementsForSubmissionYear.length > 0;

    // Category filter - check if student has achievements in the selected category
    const matchesCategoryFilter = mainCategoryFilter === "All"
      ? true
      : student.achievements && student.achievements.some(a =>
        a.category === mainCategoryFilter && a.status === 'approved'
      );

    return matchesDepartment && matchesSection && matchesYear && matchesAcademicBatch && matchesAdmissionYear && matchesSearch && matchesAchievementFilter && matchesSubmissionYear && matchesCategoryFilter;
  });

  // Group students by department
  const studentsByDepartment = departments
    .filter(dept => dept !== "All")
    .map(dept => {
      const deptStudents = students.filter(s => {
        const matchesDept = s.department === dept;
        const matchesAchievementFilter = filterType === 'withAchievements'
          ? (s.achievements && s.achievements.filter(a => a.status === 'approved').length > 0)
          : true;
        return matchesDept && matchesAchievementFilter;
      });
      return {
        department: dept,
        students: deptStudents,
        count: deptStudents.length
      };
    });

  // Group students by section for selected department
  const studentsBySection = sections
    .filter(sec => sec !== "All")
    .map(sec => ({
      section: sec,
      count: students.filter(s => {
        const matchesDept = selectedDepartment === "All" || s.department === selectedDepartment;
        const matchesSection = s.section === sec;
        const matchesAchievementFilter = filterType === 'withAchievements'
          ? (s.achievements && s.achievements.filter(a => a.status === 'approved').length > 0)
          : true;
        return matchesDept && matchesSection && matchesAchievementFilter;
      }).length
    }))
    .filter(sec => sec.count > 0); // Only show sections with students

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

  const getFieldValue = (student, fieldKey) => {
    const bySubmissionYear = (a) => {
      if (selectedSubmissionYear === "All") return true;
      if (!a?.createdAt) return false;
      return String(new Date(a.createdAt).getFullYear()) === selectedSubmissionYear;
    };

    const approvedAchievements = student.achievements?.filter(a => a.status === 'approved' && bySubmissionYear(a)).length || 0;
    const pendingAchievements = student.achievements?.filter(a => a.status === 'pending' && bySubmissionYear(a)).length || 0;
    const rejectedAchievements = student.achievements?.filter(a => a.status === 'rejected' && bySubmissionYear(a)).length || 0;

    const fieldMap = {
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      department: student.department,
      section: student.section,
      year: student.year,
      academicBatch: student.academicBatch || '',
      admissionYear: student.admissionYear || '',
      graduationYear: student.graduationYear || '',
      totalPoints: student.totalPoints || 0,
      totalAchievements: student.achievements?.length || 0,
      approvedAchievements: approvedAchievements,
      pendingAchievements: pendingAchievements,
      rejectedAchievements: rejectedAchievements,
      phoneNumber: student.erp?.phoneNumber || '',
      gender: student.erp?.gender || '',
      dateOfBirth: student.erp?.dateOfBirth ? new Date(student.erp.dateOfBirth).toLocaleDateString() : '',
      bloodGroup: student.erp?.bloodGroup || '',
      currentSemester: student.erp?.currentSemester || '',
      overallCGPA: student.erp?.overallCGPA || '',
      erpStatus: student.erp?.status || '',
      fatherName: student.erp?.fatherName || '',
      motherName: student.erp?.motherName || '',
      accommodationType: student.erp?.accommodationType || '',
      address: student.erp?.address || '',
      profilePicUrl: student.profilePicUrl || '',
      bannerUrl: student.bannerUrl || '',
      resumeUrl: student.resumeUrl || '',
      linkedin: student.socialLinks?.linkedin || '',
      github: student.socialLinks?.github || '',
      leetcode: student.socialLinks?.leetcode || '',
      codechef: student.socialLinks?.codechef || '',
      portfolio: student.socialLinks?.portfolio || '',
      createdAt: student.createdAt ? new Date(student.createdAt).toLocaleString() : '',
      updatedAt: student.updatedAt ? new Date(student.updatedAt).toLocaleString() : '',
      // Achievement details - include only approved achievements if viewing achievements page
      achievementDetails: (filterType === 'withAchievements'
        ? student.achievements?.filter(a => a.status === 'approved' && bySubmissionYear(a))
        : student.achievements?.filter(a => bySubmissionYear(a))
      )?.map(a =>
        `${a.title} (${a.category}) - ${a.points} pts - ${a.status} - Certificate: ${a.certificateUrl || 'N/A'}`
      ).join(' | ') || '',
      achievementTitles: (filterType === 'withAchievements'
        ? student.achievements?.filter(a => a.status === 'approved' && bySubmissionYear(a))
        : student.achievements?.filter(a => bySubmissionYear(a))
      )?.map(a => a.title).join(' | ') || '',
      achievementCategories: (filterType === 'withAchievements'
        ? student.achievements?.filter(a => a.status === 'approved' && bySubmissionYear(a))
        : student.achievements?.filter(a => bySubmissionYear(a))
      )?.map(a => a.category).join(' | ') || '',
      achievementPoints: (filterType === 'withAchievements'
        ? student.achievements?.filter(a => a.status === 'approved' && bySubmissionYear(a))
        : student.achievements?.filter(a => bySubmissionYear(a))
      )?.map(a => a.points).join(' | ') || '',
      achievementCertificateUrls: (filterType === 'withAchievements'
        ? student.achievements?.filter(a => a.status === 'approved' && bySubmissionYear(a))
        : student.achievements?.filter(a => bySubmissionYear(a))
      )?.map(a => a.certificateUrl || 'N/A').join(' | ') || '',
      achievementStatuses: (filterType === 'withAchievements'
        ? student.achievements?.filter(a => a.status === 'approved' && bySubmissionYear(a))
        : student.achievements?.filter(a => bySubmissionYear(a))
      )?.map(a => a.status).join(' | ') || '',
    };

    return fieldMap[fieldKey];
  };

  const handleExportCSV = () => {
    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // If the value contains comma, newline, or quotes, wrap it in quotes and escape existing quotes
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Get only selected fields
    const selectedFieldsList = availableFields.filter(field => selectedFields[field.key]);

    if (selectedFieldsList.length === 0) {
      toast.error("Please select at least one field to export");
      return;
    }

    // Create header row with selected fields
    const headerRow = selectedFieldsList.map(field => field.label).join(',');

    // Create data rows with only selected fields
    const dataRows = filteredStudents.map(student => {
      return selectedFieldsList.map(field => {
        const value = getFieldValue(student, field.key);
        return escapeCSV(value);
      }).join(',');
    });

    const csvContent = [headerRow, ...dataRows].join('\n');

    // Add BOM for proper Excel UTF-8 encoding and set charset
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Generate filename based on filters
    let fileName = 'students';
    if (selectedDepartment !== "All") {
      fileName += `_${selectedDepartment}`;
    }
    if (selectedSection !== "All") {
      fileName += `_Section${selectedSection}`;
    }
    if (selectedAcademicBatch !== "All") {
      fileName += `_Batch${selectedAcademicBatch}`;
    }
    fileName += `_${new Date().toISOString().split('T')[0]}.csv`;

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    const filterInfo = [];
    if (selectedDepartment !== "All") filterInfo.push(selectedDepartment);
    if (selectedSection !== "All") filterInfo.push(`Section ${selectedSection}`);
    if (selectedAcademicBatch !== "All") filterInfo.push(`Batch ${selectedAcademicBatch}`);
    const filterText = filterInfo.length > 0 ? filterInfo.join(", ") : "All students";

    toast.success(`Exported ${filteredStudents.length} students (${filterText})`);
  };

  const handleExportZIP = async () => {
    // Get only selected fields
    const selectedFieldsList = availableFields.filter(field => selectedFields[field.key]);

    if (selectedFieldsList.length === 0) {
      toast.error("Please select at least one field to export");
      return;
    }

    try {
      toast.info("Preparing ZIP export with certificates... This may take a moment.");

      // Prepare request payload
      const payload = {
        filters: {
          department: selectedDepartment,
          section: selectedSection,
          year: selectedYear,
          submissionYear: selectedSubmissionYear,
          academicBatch: selectedAcademicBatch,
          admissionYear: selectedAdmissionYear,
          searchQuery: searchQuery,
          filterType: filterType
        },
        selectedFields: selectedFields
      };

      // Make API request
      const response = await axios.post('/admin/students/export-zip', payload, {
        responseType: 'blob',
        timeout: 120000 // 2 minute timeout for large exports
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const filterInfo = [];
      if (selectedDepartment !== "All") filterInfo.push(selectedDepartment);
      if (selectedSection !== "All") filterInfo.push(`Section ${selectedSection}`);
      if (selectedAcademicBatch !== "All") filterInfo.push(`Batch ${selectedAcademicBatch}`);
      const filterText = filterInfo.length > 0 ? filterInfo.join(", ") : "All students";

      toast.success(`Exported ${filteredStudents.length} students with certificates (${filterText})`);
    } catch (error) {
      console.error("ZIP export error:", error);
      toast.error("Failed to export ZIP file. Please try again.");
    }
  };

  const handleExportAchievements = async () => {
    try {
      toast.info("Exporting approved achievements...");
      const params = {};
      if (selectedSubmissionYear !== "All") {
        params.submissionYear = selectedSubmissionYear;
      }

      const response = await axios.get("/achievements/admin/export", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `approved_achievements_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export successful!");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export achievements");
    }
  };

  const handleViewStudent = async (student) => {
    try {
      // Fetch full student details with achievements
      const res = await axios.get(`/admin/students/${student._id}`);
      setSelectedStudent(res.data.student);
      setOpenDialog(true);
    } catch (err) {
      console.error("Failed to fetch student details:", err);
      toast.error("Failed to load student details");
    }
  };

  const handleDownloadCertificate = async (achievement) => {
    if (achievement.certificateUrl) {
      window.open(getFileUrl(achievement.certificateUrl), '_blank');
    } else if (achievement.proofFiles && achievement.proofFiles.length > 0) {
      achievement.proofFiles.forEach((file, index) => {
        setTimeout(() => window.open(getFileUrl(file), '_blank'), index * 100);
      });
    } else {
      toast.error("No certificate available");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setAchievementCategoryFilter("All"); // Reset filter when closing
  };

  // Get available years based on selected academic batch
  const getAvailableYears = () => {
    const allYears = ["All", "I", "II", "III", "IV"];

    if (selectedAcademicBatch === "All") {
      return allYears;
    }

    // Calculate which years should be available for the selected batch
    const batchParts = selectedAcademicBatch.split('-');
    if (batchParts.length === 2) {
      const admissionYear = parseInt(batchParts[0]);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // Determine current academic year (June to May cycle)
      const currentAcademicYear = currentMonth >= 6 ? currentYear : currentYear - 1;

      // Calculate how many years the batch has been in college
      const yearsInCollege = currentAcademicYear - admissionYear + 1;

      const availableYears = ["All"];
      for (let i = 1; i <= Math.min(yearsInCollege, 4); i++) {
        const romanYear = i === 1 ? "I" : i === 2 ? "II" : i === 3 ? "III" : "IV";
        availableYears.push(romanYear);
      }
      return availableYears;
    }

    return allYears;
  };

  // Filter achievements by category
  const getFilteredAchievements = (achievements) => {
    if (!achievements) return [];
    if (achievementCategoryFilter === "All") return achievements;
    return achievements.filter(a => a.category === achievementCategoryFilter);
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedDepartment("All");
    setSelectedSection("All");
    setSelectedYear("All");
    setSelectedSubmissionYear("All");
    setSelectedAcademicBatch("All");
    setSelectedAdmissionYear("All");
    setMainCategoryFilter("All");
    setSearchQuery("");
    setFilterType(null);
    toast.info("All filters cleared");

    // Refetch students after clearing filters
    fetchStudents();
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return selectedDepartment !== "All" ||
      selectedSection !== "All" ||
      selectedYear !== "All" ||
      selectedAcademicBatch !== "All" ||
      selectedAdmissionYear !== "All" ||
      mainCategoryFilter !== "All" ||
      searchQuery !== "" ||
      filterType;
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
                  {filterType === 'withAchievements' ? 'Students with Achievements' : 'All Students'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  {filterType === 'withAchievements'
                    ? `${filteredStudents.length} students with approved achievements`
                    : `Total ${students.length} students across all departments`
                  }
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
                startIcon={<FileSpreadsheet className="w-4 h-4" />}
                onClick={handleExportAchievements}
                sx={{
                  backgroundColor: '#6366F1',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  mr: 2,
                  '&:hover': {
                    backgroundColor: '#4F46E5'
                  }
                }}
              >
                Export Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<Download className="w-4 h-4" />}
                onClick={handleOpenFieldSelector}
                disabled={filteredStudents.length === 0}
                sx={{
                  backgroundColor: '#10B981',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#059669'
                  },
                  '&:disabled': {
                    backgroundColor: '#E5E7EB',
                    color: '#9CA3AF'
                  }
                }}
              >
                Download CSV ({filteredStudents.length})
              </Button>
            </Box>
          </Box>

          {/* Department Statistics */}
          <Grid container spacing={3} className="mb-6">
            {studentsByDepartment.map((dept, index) => (
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
            {/* Filter Instructions */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#6B7280', fontStyle: 'italic' }}>
                💡 <strong>Filter Guide:</strong> Start with Academic Batch to filter by graduation year, then narrow down by Year (I-IV), Department, Section, or Category for precise results.
              </Typography>
            </Box>
            {(hasActiveFilters()) && (
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {filterType === 'withAchievements' && (
                  <Chip
                    icon={<Award className="w-4 h-4" />}
                    label="Showing only students with approved achievements"
                    onDelete={() => setFilterType(null)}
                    sx={{
                      backgroundColor: '#EEF2FF',
                      color: '#6366F1',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': {
                        color: '#6366F1'
                      }
                    }}
                  />
                )}
                {mainCategoryFilter !== "All" && (
                  <Chip
                    icon={<Filter className="w-4 h-4" />}
                    label={`Category: ${mainCategoryFilter}`}
                    onDelete={() => setMainCategoryFilter("All")}
                    sx={{
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': {
                        color: '#D97706'
                      }
                    }}
                  />
                )}
                {selectedAcademicBatch !== "All" && (
                  <Chip
                    icon={<GraduationCap className="w-4 h-4" />}
                    label={`Batch: ${selectedAcademicBatch}`}
                    onDelete={() => setSelectedAcademicBatch("All")}
                    sx={{
                      backgroundColor: '#DBEAFE',
                      color: '#2563EB',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': {
                        color: '#2563EB'
                      }
                    }}
                  />
                )}
                {selectedDepartment !== "All" && (
                  <Chip
                    label={`Department: ${selectedDepartment}`}
                    onDelete={() => setSelectedDepartment("All")}
                    sx={{
                      backgroundColor: '#F3E8FF',
                      color: '#7C3AED',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': {
                        color: '#7C3AED'
                      }
                    }}
                  />
                )}
                {selectedSection !== "All" && (
                  <Chip
                    label={`Section: ${selectedSection}`}
                    onDelete={() => setSelectedSection("All")}
                    sx={{
                      backgroundColor: '#F0FDF4',
                      color: '#16A34A',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': {
                        color: '#16A34A'
                      }
                    }}
                  />
                )}
                {selectedYear !== "All" && (
                  <Chip
                    label={`Year: ${selectedYear}`}
                    onDelete={() => setSelectedYear("All")}
                    sx={{
                      backgroundColor: '#FFF7ED',
                      color: '#EA580C',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': {
                        color: '#EA580C'
                      }
                    }}
                  />
                )}
                <Button
                  variant="text"
                  size="small"
                  onClick={clearAllFilters}
                  sx={{
                    color: '#6B7280',
                    textTransform: 'none',
                    minWidth: 'auto',
                    p: 1,
                    '&:hover': {
                      backgroundColor: '#F9FAFB'
                    }
                  }}
                >
                  Clear All
                </Button>
              </Box>
            )}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, roll number, or academic year (e.g., 2023-2027)..."
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

              {/* Primary Academic Filters */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Academic Batch"
                  value={selectedAcademicBatch}
                  onChange={(e) => {
                    setSelectedAcademicBatch(e.target.value);
                    // Reset other filters when batch changes
                    if (e.target.value !== "All") {
                      setSelectedYear("All");
                    }
                  }}
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
                  label="Submission Year"
                  value={selectedSubmissionYear}
                  onChange={(e) => setSelectedSubmissionYear(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                >
                  {submissionYears.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y === "All" ? "All Years" : y}
                    </MenuItem>
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
                    <MenuItem key={year} value={year}>
                      {year === "All" ? "All Years" : `Year ${year}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Secondary Filters */}
              <Grid item xs={12} md={1.5}>
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
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={1}>
                <TextField
                  fullWidth
                  select
                  label="Section"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                >
                  {sections.map((section) => {
                    const sectionCount = section === "All"
                      ? students.filter(s => {
                        const matchesDept = selectedDepartment === "All" || s.department === selectedDepartment;
                        const matchesAchievementFilter = filterType === 'withAchievements'
                          ? (s.achievements && s.achievements.filter(a => a.status === 'approved').length > 0)
                          : true;
                        return matchesDept && matchesAchievementFilter;
                      }).length
                      : students.filter(s => {
                        const matchesDept = selectedDepartment === "All" || s.department === selectedDepartment;
                        const matchesSection = s.section === section;
                        const matchesAchievementFilter = filterType === 'withAchievements'
                          ? (s.achievements && s.achievements.filter(a => a.status === 'approved').length > 0)
                          : true;
                        return matchesDept && matchesSection && matchesAchievementFilter;
                      }).length;
                    return (
                      <MenuItem key={section} value={section}>
                        {section === "All" ? "All" : section} {sectionCount > 0 ? `(${sectionCount})` : ""}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={mainCategoryFilter}
                  onChange={(e) => setMainCategoryFilter(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                >
                  {achievementCategories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
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

          {/* Students Display */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
                </Grid>
              ))}
            </Grid>
          ) : filteredStudents.length === 0 ? (
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
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                No students found
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Try adjusting your filters or search query
              </Typography>
            </Card>
          ) : viewMode === "grid" ? (
            <Grid container spacing={3}>
              {filteredStudents.map((student, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={student._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      elevation={0}
                      onClick={() => handleViewStudent(student)}
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
                      {/* Avatar and Name */}
                      <Box className="flex flex-col items-center mb-3">
                        <Avatar
                          src={student.profilePicUrl ? getFileUrl(student.profilePicUrl) : undefined}
                          sx={{
                            width: 80,
                            height: 80,
                            backgroundColor: '#6366F1',
                            fontSize: '2rem',
                            fontWeight: 700,
                            mb: 2
                          }}
                        >
                          {student.name?.[0] || 'S'}
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
                          {student.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                          {student.rollNumber}
                        </Typography>
                      </Box>

                      {/* Department and Details */}
                      <Box className="space-y-2 mb-3">
                        <Box className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            {student.department} - {student.section}
                          </Typography>
                        </Box>
                        <Box className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            Year {student.year}
                          </Typography>
                        </Box>
                        {student.academicBatch && (
                          <Box className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-400" />
                            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                              Batch {student.academicBatch}
                            </Typography>
                          </Box>
                        )}
                        <Box className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#6B7280',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {student.email}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Stats */}
                      <Box className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <Box className="text-center">
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366F1' }}>
                            {student.totalPoints || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            Points
                          </Typography>
                        </Box>
                        <Box className="text-center">
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                            {student.achievements?.length || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            Achievements
                          </Typography>
                        </Box>
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
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Section</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Year</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Academic Batch</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Points</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Achievements</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student._id}
                      onClick={() => handleViewStudent(student)}
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
                            src={student.profilePicUrl ? getFileUrl(student.profilePicUrl) : undefined}
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#6366F1'
                            }}
                          >
                            {student.name?.[0] || 'S'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                              {student.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              {student.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {student.rollNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={student.department}
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
                          {student.section}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          Year {student.year}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={student.academicBatch || 'N/A'}
                          size="small"
                          sx={{
                            backgroundColor: '#EEF2FF',
                            color: '#6366F1',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#6366F1' }}>
                          {student.totalPoints || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>
                          {student.achievements?.length || 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Student Detail Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ backgroundColor: '#6366F1', color: 'white', fontWeight: 700 }}>
              Student Profile
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {selectedStudent && (
                <Box>
                  {/* Student Info */}
                  <Box className="flex items-center gap-4 mb-4">
                    <Avatar
                      src={selectedStudent.profilePicUrl ? getFileUrl(selectedStudent.profilePicUrl) : undefined}
                      sx={{
                        width: 100,
                        height: 100,
                        backgroundColor: '#6366F1',
                        fontSize: '2.5rem',
                        fontWeight: 700
                      }}
                    >
                      {selectedStudent.name?.[0] || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
                        {selectedStudent.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Roll Number:</strong> {selectedStudent.rollNumber}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Email:</strong> {selectedStudent.email}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Department:</strong> {selectedStudent.department} | <strong>Section:</strong> {selectedStudent.section} | <strong>Year:</strong> {selectedStudent.year}
                      </Typography>
                      {selectedStudent.academicBatch && (
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          <strong>Academic Batch:</strong> {selectedStudent.academicBatch} ({selectedStudent.admissionYear} - {selectedStudent.graduationYear})
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Stats */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Card elevation={0} sx={{ p: 2, backgroundColor: '#F9FAFB', textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366F1' }}>
                          {selectedStudent.totalPoints || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          Total Points
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card elevation={0} sx={{ p: 2, backgroundColor: '#F9FAFB', textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
                          {selectedStudent.achievements?.length || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          Achievements
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Achievements List */}
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
                    Achievements & Certificates
                  </Typography>

                  {/* Category Filter */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#6B7280' }}>Filter by Category:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {achievementCategories.map((cat) => (
                        <Chip
                          key={cat}
                          label={cat}
                          onClick={() => setAchievementCategoryFilter(cat)}
                          color={achievementCategoryFilter === cat ? "primary" : "default"}
                          variant={achievementCategoryFilter === cat ? "filled" : "outlined"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: achievementCategoryFilter === cat ? '#4F46E5' : 'rgba(99, 102, 241, 0.1)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {selectedStudent.achievements && selectedStudent.achievements.length > 0 ? (
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {getFilteredAchievements(selectedStudent.achievements).length > 0 ? (
                        getFilteredAchievements(selectedStudent.achievements).map((achievement, idx) => (
                          <ListItem
                            key={idx}
                            sx={{
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              mb: 1,
                              backgroundColor: 'white'
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                                  {achievement.title}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                                    {achievement.description}
                                  </Typography>
                                  <Box className="flex gap-2 items-center" sx={{ flexWrap: 'wrap' }}>
                                    <Chip
                                      label={achievement.category || "Uncategorized"}
                                      size="small"
                                      sx={{
                                        backgroundColor: '#6366F1',
                                        color: 'white',
                                        fontWeight: 600
                                      }}
                                    />
                                    <Chip
                                      label={achievement.status}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          achievement.status === 'approved' ? '#10B981' :
                                            achievement.status === 'pending' ? '#F59E0B' : '#EF4444',
                                        color: 'white',
                                        fontWeight: 600
                                      }}
                                    />
                                    <Chip
                                      label={`${achievement.points || 0} points`}
                                      size="small"
                                      sx={{ backgroundColor: '#E5E7EB', fontWeight: 600 }}
                                    />
                                    {(achievement.certificateUrl || (achievement.proofFiles && achievement.proofFiles.length > 0)) && (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<Download className="w-4 h-4" />}
                                        onClick={() => handleDownloadCertificate(achievement)}
                                        sx={{
                                          borderColor: '#6366F1',
                                          color: '#6366F1',
                                          textTransform: 'none',
                                          '&:hover': {
                                            backgroundColor: 'rgba(99, 102, 241, 0.05)'
                                          }
                                        }}
                                      >
                                        Download Certificate
                                      </Button>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center', py: 3 }}>
                          No achievements found for "{achievementCategoryFilter}" category
                        </Typography>
                      )}
                    </List>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center', py: 3 }}>
                      No achievements yet
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={handleCloseDialog}
                variant="contained"
                sx={{
                  backgroundColor: '#6366F1',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#4F46E5'
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Field Selector Dialog for CSV Export */}
          <Dialog
            open={openFieldSelector}
            onClose={handleCloseFieldSelector}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ backgroundColor: '#10B981', color: 'white', fontWeight: 700 }}>
              Select Fields to Export
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                  Choose which fields you want to include in your CSV export:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleSelectAllFields}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#10B981',
                      color: '#10B981',
                      '&:hover': {
                        borderColor: '#059669',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)'
                      }
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleDeselectAllFields}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#EF4444',
                      color: '#EF4444',
                      '&:hover': {
                        borderColor: '#DC2626',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)'
                      }
                    }}
                  >
                    Deselect All
                  </Button>
                </Box>
              </Box>

              {/* Group fields by category */}
              {['Basic Information', 'Academic Details', 'Performance Metrics', 'ERP Personal Data', 'ERP Academic Data', 'Family Details', 'Other Details', 'Profile Assets', 'Social Links', 'Timestamps', 'Achievements'].map(category => {
                const categoryFields = availableFields.filter(f => f.category === category);
                const selectedCount = categoryFields.filter(f => selectedFields[f.key]).length;

                return (
                  <Box key={category} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                        {category} ({selectedCount}/{categoryFields.length})
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => handleSelectCategory(category)}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          color: '#6366F1',
                          '&:hover': {
                            backgroundColor: 'rgba(99, 102, 241, 0.05)'
                          }
                        }}
                      >
                        Select All
                      </Button>
                    </Box>
                    <FormGroup row sx={{ pl: 2 }}>
                      {categoryFields.map(field => (
                        <FormControlLabel
                          key={field.key}
                          control={
                            <Checkbox
                              checked={selectedFields[field.key] || false}
                              onChange={() => handleFieldToggle(field.key)}
                              sx={{
                                color: '#6366F1',
                                '&.Mui-checked': {
                                  color: '#6366F1',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              {field.label}
                            </Typography>
                          }
                          sx={{ minWidth: '200px', mb: 0.5 }}
                        />
                      ))}
                    </FormGroup>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                );
              })}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                onClick={handleCloseFieldSelector}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  borderColor: '#6B7280',
                  color: '#6B7280',
                  '&:hover': {
                    borderColor: '#4B5563',
                    backgroundColor: 'rgba(107, 114, 128, 0.05)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleExportCSV();
                  handleCloseFieldSelector();
                }}
                variant="outlined"
                startIcon={<Download className="w-4 h-4" />}
                sx={{
                  borderColor: '#10B981',
                  color: '#10B981',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#059669',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)'
                  }
                }}
              >
                Export CSV Only
              </Button>
              <Button
                onClick={() => {
                  handleExportZIP();
                  handleCloseFieldSelector();
                }}
                variant="contained"
                startIcon={<Download className="w-4 h-4" />}
                sx={{
                  backgroundColor: '#6366F1',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#4F46E5'
                  }
                }}
              >
                Export ZIP (CSV + Certificates)
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}
