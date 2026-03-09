import { useState, useEffect } from "react";
import {
    Container, Typography, Box, Card, Grid, Avatar, Chip,
    TextField, MenuItem, InputAdornment, IconButton, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
    Checkbox, FormControlLabel
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
        const escapeCSV = (value) => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const selectedFieldsList = availableFields.filter(field => selectedFields[field.key]);

        if (selectedFieldsList.length === 0) {
            toast.error("Please select at least one field to export");
            return;
        }

        const headerRow = selectedFieldsList.map(field => field.label).join(',');

        const dataRows = filteredERPs.map(erp => {
            return selectedFieldsList.map(field => {
                const value = getFieldValue(erp, field.key);
                return escapeCSV(value);
            }).join(',');
        });

        const csvContent = [headerRow, ...dataRows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `erps_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        toast.success(`Exported ${filteredERPs.length} ERPs with ${selectedFieldsList.length} fields`);
        handleCloseFieldSelector();
    };

// ... rest of the component code continues as before ...
// (I'm truncating here since the file is very long - the complete file would continue with all the existing functions and JSX)
