import { useState } from "react";
import { Box, Typography, Card, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip } from "@mui/material";
import { FileText, Download, Eye, X, Image, FileIcon } from "lucide-react";
import { getFileUrl } from "../config/api";
import { toast } from "react-toastify";

export default function ViewUploadedFiles({ erpData }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!erpData) return null;

  // Collect all uploaded files from ERP data
  const getUploadedFiles = () => {
    const files = [];
    
    // Personal/Educational documents
    if (erpData.tenthProofUrl) {
      files.push({
        name: "10th Grade Certificate",
        url: erpData.tenthProofUrl,
        category: "Educational",
        type: getFileType(erpData.tenthProofUrl)
      });
    }
    
    if (erpData.intermediateProofUrl) {
      files.push({
        name: "Intermediate Certificate",
        url: erpData.intermediateProofUrl,
        category: "Educational",
        type: getFileType(erpData.intermediateProofUrl)
      });
    }
    
    if (erpData.scholarshipProofUrl) {
      files.push({
        name: "Scholarship Proof",
        url: erpData.scholarshipProofUrl,
        category: "Financial",
        type: getFileType(erpData.scholarshipProofUrl)
      });
    }
    
    // Project/Training certificates
    if (erpData.projects) {
      erpData.projects.forEach((project, index) => {
        if (project.certificateUrl) {
          files.push({
            name: `${project.title} - Certificate`,
            url: project.certificateUrl,
            category: "Projects",
            type: getFileType(project.certificateUrl)
          });
        }
      });
    }
    
    if (erpData.internships) {
      erpData.internships.forEach((internship, index) => {
        if (internship.certificateUrl) {
          files.push({
            name: `${internship.company} - Internship Certificate`,
            url: internship.certificateUrl,
            category: "Internships",
            type: getFileType(internship.certificateUrl)
          });
        }
      });
    }
    
    if (erpData.certifications) {
      erpData.certifications.forEach((cert, index) => {
        if (cert.certificateUrl) {
          files.push({
            name: cert.name || `Certification ${index + 1}`,
            url: cert.certificateUrl,
            category: "Certifications",
            type: getFileType(cert.certificateUrl)
          });
        }
      });
    }
    
    // Research papers
    if (erpData.researchWorks) {
      erpData.researchWorks.forEach((research, index) => {
        if (research.paperUrl) {
          files.push({
            name: `${research.title} - Research Paper`,
            url: research.paperUrl,
            category: "Research",
            type: getFileType(research.paperUrl)
          });
        }
        if (research.certificateUrl) {
          files.push({
            name: `${research.title} - Certificate`,
            url: research.certificateUrl,
            category: "Research",
            type: getFileType(research.certificateUrl)
          });
        }
      });
    }
    
    return files;
  };

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'document';
    return 'file';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      default: return <FileIcon className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Educational': return 'primary';
      case 'Financial': return 'secondary';
      case 'Projects': return 'success';
      case 'Internships': return 'info';
      case 'Certifications': return 'warning';
      case 'Research': return 'error';
      default: return 'default';
    }
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setDialogOpen(true);
  };

  const handleDownloadFile = (file) => {
    try {
      const fileUrl = getFileUrl(file.url);
      console.log('Attempting to open file:', { originalUrl: file.url, constructedUrl: fileUrl });
      
      // Validate URL before opening
      if (!fileUrl || fileUrl.includes('undefined') || !fileUrl.startsWith('http')) {
        toast.error('Invalid file URL. Please contact support.');
        return;
      }
      
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error opening file:', error);
      toast.error('Failed to open file');
    }
  };

  const uploadedFiles = getUploadedFiles();

  if (uploadedFiles.length === 0) {
    return (
      <Box className="mb-6">
        <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Uploaded Documents
        </Typography>
        <Card className="p-4 text-center">
          <Typography variant="body2" color="text.secondary">
            📄 No documents uploaded yet
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="mb-6">
      <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" /> Uploaded Documents ({uploadedFiles.length})
      </Typography>
      
      <Grid container spacing={2}>
        {uploadedFiles.map((file, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card className="p-3 h-full">
              <Box className="flex items-start justify-between mb-2">
                <Box className="flex items-center gap-2 flex-1">
                  {getFileIcon(file.type)}
                  <Typography variant="body2" className="font-semibold text-sm line-clamp-2">
                    {file.name}
                  </Typography>
                </Box>
              </Box>
              
              <Chip 
                label={file.category} 
                size="small" 
                color={getCategoryColor(file.category)}
                className="mb-2"
              />
              
              <Box className="flex gap-1 mt-2">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Eye className="w-4 h-4" />}
                  onClick={() => handleViewFile(file)}
                  className="flex-1"
                >
                  View
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Download className="w-4 h-4" />}
                  onClick={() => handleDownloadFile(file)}
                  className="flex-1"
                >
                  Download
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* File Preview Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
        disableEnforceFocus={false}
        aria-labelledby="file-preview-dialog-title"
        aria-describedby="file-preview-dialog-description"
      >
        <DialogTitle 
          id="file-preview-dialog-title"
          className="flex items-center justify-between"
        >
          <Box className="flex items-center gap-2">
            {selectedFile && getFileIcon(selectedFile.type)}
            <Typography variant="h6">{selectedFile?.name}</Typography>
          </Box>
          <IconButton onClick={() => setDialogOpen(false)}>
            <X className="w-5 h-5" />
          </IconButton>
        </DialogTitle>
        
        <DialogContent id="file-preview-dialog-description">
          {selectedFile && (
            <Box className="text-center">
              {selectedFile.type === 'image' ? (
                <img 
                  src={getFileUrl(selectedFile.url)} 
                  alt={selectedFile.name}
                  className="max-w-full max-h-96 object-contain mx-auto"
                />
              ) : (
                <Box className="p-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <Typography variant="body1" className="mb-4">
                    Preview not available for this file type
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Download className="w-4 h-4" />}
                    onClick={() => handleDownloadFile(selectedFile)}
                  >
                    Download to View
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {selectedFile && (
            <Button
              variant="contained"
              startIcon={<Download className="w-4 h-4" />}
              onClick={() => handleDownloadFile(selectedFile)}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}