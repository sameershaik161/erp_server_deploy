# ZIP Export Feature - Complete Guide

## Overview
Students with achievements can now be exported as a ZIP file containing:
1. **students_achievements.csv** - Filtered student data with selected fields
2. **/certificates/** folder - Achievement certificate files (PDF/JPG/PNG)

## Features Implemented

### Backend API
- **Endpoint**: `POST /api/admin/students/export-zip`
- **Authentication**: Admin token required
- **Package**: `archiver` for ZIP streaming

### Request Payload
```json
{
  "filters": {
    "department": "CSE",           // or "All"
    "section": "A",                // or "All"
    "year": "III",                 // or "All"
    "academicBatch": "2021-2025",  // or "All"
    "admissionYear": "2021",       // or "All"
    "searchQuery": "",             // search term
    "filterType": "withAchievements" // or null
  },
  "selectedFields": {
    "name": true,
    "rollNumber": true,
    "email": true,
    "department": true,
    // ... all selected fields
    "achievementCertificateUrls": true
  }
}
```

### Response
- **Content-Type**: `application/zip`
- **File Name**: `students_export_YYYY-MM-DD.zip`
- **Streaming**: Files are streamed (not loaded into memory)

## ZIP Structure
```
students_export_2026-02-02.zip
├── students_achievements.csv
└── certificates/
    ├── 231FA04893_NPTEL_Python_1.pdf
    ├── 231FA04893_Hackathon_Winner_1.jpg
    ├── 231FA05001_AWS_Certification_1.pdf
    └── ...
```

## Certificate File Naming
Format: `{rollNumber}_{achievementTitle}_{fileIndex}.{ext}`

Examples:
- `231FA04893_NPTEL_Python_Programming_1.pdf`
- `231FA05001_National_Hackathon_Winner_2.jpg`
- `231FA05002_Research_Paper_Published_1.pdf`

## CSV Fields
All selected fields are exported, including:
- Basic Information (name, roll number, email, etc.)
- Academic Details (batch, year, CGPA, etc.)
- Performance Metrics (points, achievements count, etc.)
- Achievement Details (titles, categories, points, statuses)
- Certificate URLs (for reference)

## Usage Flow

### Admin Flow
1. Navigate to `/admin/students`
2. Apply filters (department, year, batch, etc.)
3. Click "Download CSV" button
4. **Modal opens**: "Select Fields to Export"
5. Select required fields using checkboxes
6. Click one of:
   - **"Export CSV Only"** - Downloads CSV file only
   - **"Export ZIP (CSV + Certificates)"** - Downloads ZIP with CSV and files

### Frontend Implementation
```javascript
const handleExportZIP = async () => {
  const payload = {
    filters: {
      department: selectedDepartment,
      section: selectedSection,
      year: selectedYear,
      academicBatch: selectedAcademicBatch,
      admissionYear: selectedAdmissionYear,
      searchQuery: searchQuery,
      filterType: filterType
    },
    selectedFields: selectedFields
  };

  const response = await axios.post('/admin/students/export-zip', payload, {
    responseType: 'blob'
  });

  // Download the ZIP file
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
```

### Backend Implementation Highlights
```javascript
export async function exportStudentsZIP(req, res) {
  // 1. Parse filters and query students
  const students = await User.find(query).populate('achievements');
  
  // 2. Generate CSV content
  const csvContent = generateCSV(students, selectedFields);
  
  // 3. Create ZIP archive
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);
  
  // 4. Add CSV to archive
  archive.append(csvContent, { name: 'students_achievements.csv' });
  
  // 5. Add certificate files
  for (const student of students) {
    for (const achievement of student.achievements) {
      if (achievement.proofFiles) {
        achievement.proofFiles.forEach((fileUrl, i) => {
          const filePath = getFilePath(fileUrl);
          if (fs.existsSync(filePath)) {
            const certFileName = `${student.rollNumber}_${sanitize(achievement.title)}_${i+1}.ext`;
            archive.file(filePath, { name: `certificates/${certFileName}` });
          }
        });
      }
    }
  }
  
  // 6. Finalize and stream
  await archive.finalize();
}
```

## Error Handling

### Missing Files
- If a certificate file doesn't exist, it's skipped (not added to ZIP)
- Warning logged in console
- CSV still includes the student record
- Export continues without breaking

### Memory Efficiency
- ZIP is **streamed** directly to response
- Files are read and piped one at a time
- No full ZIP stored in server memory
- Suitable for large exports

## Best Practices

### File Naming
- Special characters removed from achievement titles
- Replaced with underscores
- Roll number prefix for easy identification
- File index added for multiple files per achievement

### Performance
- Database query filters applied before fetching
- Only selected students' files are processed
- Efficient file streaming using archiver
- Suitable for 100+ students with 1000+ certificates

### Security
- Admin authentication required
- File path validation to prevent directory traversal
- Only files in `/uploads/` folder are accessible
- Token-based authentication for file access

## Testing

### Test Cases
1. **Filter Test**: Export specific department/year
2. **Field Selection**: Export only selected fields
3. **Missing Files**: Handle missing certificate files gracefully
4. **Large Export**: Test with 50+ students, 200+ files
5. **Empty Results**: Handle no students matching filters

### Expected Behavior
- ✅ ZIP downloads successfully
- ✅ CSV contains filtered data with selected fields
- ✅ Certificates folder contains all available files
- ✅ Missing files don't break export
- ✅ File names are sanitized and readable
- ✅ Toast notifications show progress

## Troubleshooting

### ZIP Download Fails
- Check backend logs for errors
- Verify `archiver` package is installed
- Ensure uploads folder exists and has files

### Missing Certificates
- Files must exist in `/backend/uploads/` folder
- File URLs in database must match actual filenames
- Check console for "File not found" warnings

### Large File Timeouts
- Increase request timeout in axios config
- Use compression level 6-9 in archiver
- Consider pagination for very large exports

## Package Dependencies

```json
{
  "backend": {
    "archiver": "^6.0.1"
  }
}
```

Install with: `npm install archiver`

## File Locations

- **Backend Controller**: `/backend/src/controllers/admin.controller.js`
- **Backend Route**: `/backend/src/routes/admin.routes.js`
- **Frontend Page**: `/frontend/skillflux/src/pages/Admin/Students.jsx`
- **Uploads Folder**: `/backend/uploads/`

## Summary

This feature provides a comprehensive export solution that:
- ✅ Respects all applied filters
- ✅ Exports only selected fields
- ✅ Includes achievement certificate files
- ✅ Handles missing files gracefully
- ✅ Streams ZIP without memory issues
- ✅ Uses clean, sanitized file naming
- ✅ Works with existing authentication
- ✅ Provides two export options (CSV only or ZIP)
