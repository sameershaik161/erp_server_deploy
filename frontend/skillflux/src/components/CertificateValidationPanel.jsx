import React, { useState, useEffect } from 'react';
import { 
  Paper, Box, Typography, Chip, Button, Card, CardContent, 
  Alert, LinearProgress, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText, Divider, IconButton
} from '@mui/material';
import { 
  Security, Warning, CheckCircle, Error, ExpandMore, 
  Visibility, Shield, Flag, TrendingUp, Assessment 
} from '@mui/icons-material';
import axios from '../api/axiosInstance';
import { toast } from 'react-toastify';

export default function CertificateValidationPanel({ achievement, onValidationComplete }) {
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(achievement?.validationResult || null);
  const [showDetails, setShowDetails] = useState(false);

  const trustScoreValue = (() => {
    const n = Number(validation?.trustScore);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  })();

  const runValidation = async () => {
    try {
      setValidating(true);
      
      const res = await axios.post(`/admin/achievements/${achievement._id}/validate-certificate`);
      
      setValidation(res.data.validation);
      toast.success('Certificate validation completed!');
      
      if (onValidationComplete) {
        onValidationComplete(res.data.validation);
      }
      
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setValidating(false);
    }
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getTrustScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle />;
    if (score >= 60) return <Warning />;
    return <Error />;
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation === 'APPROVE') return 'success';
    if (recommendation === 'REVIEW' || recommendation === 'MANUAL_REVIEW') return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ mt: 2, border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Security color="primary" />
            <Typography variant="h6">Certificate Validation</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={runValidation}
            disabled={validating || !achievement.proofFiles?.length}
            startIcon={<Assessment />}
            sx={{ ml: 'auto' }}
          >
            {validating ? 'Analyzing...' : validation ? 'Re-validate' : 'Validate Certificate'}
          </Button>
        </Box>

        {validating && (
          <Box mb={2}>
            <LinearProgress />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              AI is analyzing the certificate for authenticity and fraud indicators...
            </Typography>
          </Box>
        )}

        {validation && (
          <Box>
            {/* Trust Score Overview */}
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                {getTrustScoreIcon(trustScoreValue)}
                <Typography variant="h6">
                  Trust Score: {trustScoreValue}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={trustScoreValue}
                color={getTrustScoreColor(trustScoreValue)}
                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
              />
              <Chip
                label={validation.isValid ? 'VALID' : 'SUSPICIOUS'}
                color={validation.isValid ? 'success' : 'error'}
                icon={validation.isValid ? <CheckCircle /> : <Flag />}
              />
            </Box>

            {/* Red Flags Alert */}
            {validation.flags && validation.flags.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  ⚠️ Red Flags Detected:
                </Typography>
                <List dense>
                  {validation.flags.map((flag, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Flag color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={flag} />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}

            {/* Recommendations */}
            {validation.recommendations && validation.recommendations.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  🎯 Recommendations:
                </Typography>
                {validation.recommendations.map((rec, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 1 }}>
                    {rec}
                  </Alert>
                ))}
              </Box>
            )}

            {/* Detailed Analysis */}
            <Accordion expanded={showDetails} onChange={() => setShowDetails(!showDetails)}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">Detailed Analysis</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {validation.aiAnalysis && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      🤖 AI Analysis Results:
                    </Typography>
                    
                    <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                      <Chip
                        label={`Authenticity: ${validation.aiAnalysis.authenticity_score || 'N/A'}%`}
                        color={validation.aiAnalysis.authenticity_score >= 70 ? 'success' : 'warning'}
                        variant="outlined"
                      />
                      <Chip
                        label={`Issuer Legitimacy: ${validation.aiAnalysis.issuer_legitimacy || 'N/A'}%`}
                        color={validation.aiAnalysis.issuer_legitimacy >= 70 ? 'success' : 'warning'}
                        variant="outlined"
                      />
                      <Chip
                        label={`Content Accuracy: ${validation.aiAnalysis.content_accuracy || 'N/A'}%`}
                        color={validation.aiAnalysis.content_accuracy >= 70 ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>

                    {validation.aiAnalysis.detailed_notes && (
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>AI Analysis Notes:</strong> {validation.aiAnalysis.detailed_notes}
                        </Typography>
                      </Box>
                    )}

                    {validation.aiAnalysis.positive_indicators && validation.aiAnalysis.positive_indicators.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="subtitle3" color="success.main" gutterBottom>
                          ✅ Positive Indicators:
                        </Typography>
                        <List dense>
                          {validation.aiAnalysis.positive_indicators.map((indicator, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircle color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={indicator} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {validation.aiAnalysis.fraud_indicators && validation.aiAnalysis.fraud_indicators.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="subtitle3" color="error.main" gutterBottom>
                          🚨 Fraud Indicators:
                        </Typography>
                        <List dense>
                          {validation.aiAnalysis.fraud_indicators.map((indicator, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <Error color="error" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={indicator} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}

                {validation.verificationChecks && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      ✅ Verification Checks:
                    </Typography>
                    {Object.entries(validation.verificationChecks).map(([check, result]) => (
                      <Box key={check} mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {result.passed ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <Error color="error" fontSize="small" />
                          )}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {check.replace(/([A-Z])/g, ' $1')}: {result.passed ? 'PASSED' : 'FAILED'}
                          </Typography>
                        </Box>
                        {result.issues && result.issues.length > 0 && (
                          <Typography variant="caption" color="error" sx={{ ml: 3 }}>
                            Issues: {result.issues.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="textSecondary">
                  Validated on: {new Date(validation.timestamp).toLocaleString()}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {!validation && !validating && (
          <Alert severity="info">
            Click "Validate Certificate" to analyze this achievement for authenticity using AI-powered fraud detection.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}