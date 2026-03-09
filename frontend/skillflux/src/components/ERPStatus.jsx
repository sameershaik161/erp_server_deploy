import { Card, Typography, Chip, Box, Grid } from "@mui/material";
import { FileText } from "lucide-react";

export default function ERPStatus({ erpData }) {
  if (!erpData) {
    return (
      <Box className="mb-6">
        <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" /> ERP Profile
        </Typography>
        <Card className="p-4 text-center">
          <Typography variant="body2" color="text.secondary">
            📝 No ERP profile found. Complete your ERP profile to get started!
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="mb-6">
      <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" /> ERP Profile
      </Typography>
      <Card className="p-4">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box className="text-center mb-3">
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip 
                label={erpData.status?.charAt(0).toUpperCase() + erpData.status?.slice(1) || 'Draft'}
                color={erpData.status === 'verified' ? 'success' : erpData.status === 'submitted' ? 'warning' : 'default'}
                className="mt-1"
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box className="text-center">
              <Typography variant="body2" color="text.secondary">Semester</Typography>
              <Typography variant="body1" className="font-semibold">
                {erpData.currentSemester || 'Not Set'}
              </Typography>
            </Box>
          </Grid>
          {erpData.overallCGPA && (
            <Grid item xs={6}>
              <Box className="text-center">
                <Typography variant="body2" color="text.secondary">CGPA</Typography>
                <Typography variant="body1" className="font-semibold">
                  {erpData.overallCGPA}/10
                </Typography>
              </Box>
            </Grid>
          )}
          {erpData.submittedAt && (
            <Grid item xs={12}>
              <Box className="text-center">
                <Typography variant="body2" color="text.secondary">Submitted</Typography>
                <Typography variant="body2">
                  {new Date(erpData.submittedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        {erpData.status === 'draft' && (
          <Box className="mt-3 p-2 bg-blue-50 rounded">
            <Typography variant="body2" color="primary" className="text-center text-sm">
              📝 Complete and submit your ERP profile for admin verification
            </Typography>
          </Box>
        )}
        {erpData.status === 'submitted' && (
          <Box className="mt-3 p-2 bg-orange-50 rounded">
            <Typography variant="body2" color="warning" className="text-center text-sm">
              ⏳ Your ERP is under admin review
            </Typography>
          </Box>
        )}
        {erpData.status === 'verified' && (
          <Box className="mt-3 p-2 bg-green-50 rounded">
            <Typography variant="body2" color="success" className="text-center text-sm">
              ✅ Your ERP profile has been verified by admin
            </Typography>
          </Box>
        )}
        {erpData.status === 'rejected' && erpData.adminNote && (
          <Box className="mt-3 p-2 bg-red-50 rounded">
            <Typography variant="body2" color="error" className="text-center text-sm">
              ❌ Rejected: {erpData.adminNote}
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}