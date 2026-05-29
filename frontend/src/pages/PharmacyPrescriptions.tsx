/* eslint-disable */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  Stack,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
  LinearProgress
} from '@mui/material';
import {
  AssignmentTurnedIn as VerifiedIcon,
  Warning as ExpiryIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  LocalPharmacy as PharmacyIcon,
  LocalShipping as ReturnIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { useIndustryLayout } from '../hooks/useIndustryLayout';
import { formatCurrency } from '../utils/currency';

interface PrescriptionUpload {
  id: string;
  patientName: string;
  phone: string;
  uploadDate: string;
  imageMock: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  doctorName?: string;
  notes?: string;
}

interface ExpiryItem {
  id: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  daysRemaining: number;
  stock: number;
  value: number;
  supplier: string;
}

const PharmacyPrescriptions: React.FC = () => {
  const theme = useTheme();
  const { layout: industryConf } = useIndustryLayout();
  const accent = industryConf.themeStyle.primaryAccent;
  const radius = industryConf.themeStyle.borderRadius;

  const [activeTab, setActiveTab] = useState(0);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionUpload | null>(null);

  // Mock online uploaded prescriptions data
  const [prescriptions, setPrescriptions] = useState<PrescriptionUpload[]>([
    {
      id: 'RX-9820',
      patientName: 'Rohan Sharma',
      phone: '9812345670',
      uploadDate: '27-May-2026 14:30',
      imageMock: 'Prescription detailing Amoxicillin 500mg, dosage 1-0-1 for 5 days',
      status: 'PENDING',
      notes: 'Patient requesting immediate delivery.'
    },
    {
      id: 'RX-9819',
      patientName: 'Priya Patel',
      phone: '9876543210',
      uploadDate: '27-May-2026 11:15',
      imageMock: 'Prescription detailing Paracetamol 650mg, dosage 1-1-1 as needed',
      status: 'VERIFIED',
      doctorName: 'Dr. R. K. Sen',
      notes: 'Verified via WhatsApp scan copy.'
    },
    {
      id: 'RX-9818',
      patientName: 'Suresh Kumar',
      phone: '9922334455',
      uploadDate: '26-May-2026 16:45',
      imageMock: 'Prescription illegible or incomplete signature',
      status: 'REJECTED',
      notes: 'Doctor registration number missing on letterhead.'
    }
  ]);

  // Mock upcoming drug expiry batch data
  const [expiryItems] = useState<ExpiryItem[]>([
    {
      id: 'P-101',
      name: 'Amoxicillin 500mg Capsule',
      batchNumber: 'B-AMX902',
      expiryDate: '15-Jun-2026',
      daysRemaining: 19,
      stock: 120,
      value: 1440,
      supplier: 'MedLife Distributors'
    },
    {
      id: 'P-102',
      name: 'Azithromycin 250mg Tablet',
      batchNumber: 'B-AZT411',
      expiryDate: '30-Jul-2026',
      daysRemaining: 64,
      stock: 350,
      value: 4900,
      supplier: 'Apex Pharma Biotech'
    },
    {
      id: 'P-103',
      name: 'Paracetamol 650mg Fast-release',
      batchNumber: 'B-PCM011',
      expiryDate: '15-Aug-2026',
      daysRemaining: 80,
      stock: 500,
      value: 1000,
      supplier: 'Generic Drug Agency'
    }
  ]);

  const handleVerifyStatus = (id: string, newStatus: 'VERIFIED' | 'REJECTED', docName?: string) => {
    setPrescriptions(prev =>
      prev.map(p => (p.id === id ? { ...p, status: newStatus, doctorName: docName || p.doctorName } : p))
    );
    setSelectedPrescription(null);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="PENDING REVIEW" color="warning" size="small" sx={{ fontWeight: 'bold', borderRadius: '4px' }} />;
      case 'VERIFIED':
        return <Chip label="VERIFIED & APPROVED" color="success" size="small" sx={{ fontWeight: 'bold', borderRadius: '4px' }} />;
      case 'REJECTED':
        return <Chip label="REJECTED" color="error" size="small" sx={{ fontWeight: 'bold', borderRadius: '4px' }} />;
      default:
        return null;
    }
  };

  const getExpirySeverity = (days: number) => {
    if (days < 30) return { label: 'CRITICAL', color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.08) };
    if (days < 90) return { label: 'WARNING', color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.08) };
    return { label: 'SAFE', color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.08) };
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.5px', fontFamily: 'Outfit, sans-serif' }}>
            Prescription & Expiry Hub
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Process online patient prescriptions and monitor drug batch expiries
          </Typography>
        </Box>
        <PharmacyIcon sx={{ fontSize: 40, color: accent }} />
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          mb: 4,
          '& .MuiTabs-indicator': { bgcolor: accent },
          '& .MuiTab-root.Mui-selected': { color: accent }
        }}
      >
        <Tab icon={<VerifiedIcon />} iconPosition="start" label="Prescription Verification Log" sx={{ fontWeight: 'bold' }} />
        <Tab icon={<ExpiryIcon />} iconPosition="start" label="Drug Expiry Monitor" sx={{ fontWeight: 'bold' }} />
      </Tabs>

      {/* Tab 0: Prescription Log */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: `${radius}px`, overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>PRESCRIPTION ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>PATIENT NAME</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>UPLOAD DATE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>VERIFYING MD</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prescriptions.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>{row.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{row.patientName}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.phone}</Typography>
                        </TableCell>
                        <TableCell>{row.uploadDate}</TableCell>
                        <TableCell>{getStatusChip(row.status)}</TableCell>
                        <TableCell>{row.doctorName || <span style={{ color: '#cbd5e1' }}>—</span>}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => setSelectedPrescription(row)}
                            sx={{
                              color: accent,
                              borderColor: alpha(accent, 0.5),
                              fontWeight: 'bold',
                              borderRadius: `${radius - 4}px`,
                              '&:hover': { bgcolor: alpha(accent, 0.08), borderColor: accent }
                            }}
                          >
                            Review RX
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Expiry Monitor */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {expiryItems.map((item) => {
            const sev = getExpirySeverity(item.daysRemaining);
            return (
              <Grid size={{ xs: 12, md: 4 }} key={item.id}>
                <Card sx={{
                  borderRadius: `${radius}px`,
                  border: `1.5px solid ${alpha(sev.color, 0.3)}`,
                  background: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                  boxShadow: 'none',
                  p: 2.5
                }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap sx={{ maxWidth: '70%' }}>
                        {item.name}
                      </Typography>
                      <Chip label={sev.label} sx={{ bgcolor: sev.bg, color: sev.color, fontWeight: 'bold', fontSize: '0.65rem', height: 20 }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">Batch: <strong>{item.batchNumber}</strong></Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>Supplier: <strong>{item.supplier}</strong></Typography>
                    
                    <Box sx={{ mb: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Days to Expiry:</Typography>
                        <Typography variant="caption" fontWeight="bold" color={sev.color}>{item.daysRemaining} days left</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, (item.daysRemaining / 90) * 100))} sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'divider',
                        '& .MuiLinearProgress-bar': { bgcolor: sev.color }
                      }} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Stock Value</Typography>
                        <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(item.value)}</Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        startIcon={<ReturnIcon />}
                        sx={{ borderRadius: `${radius - 4}px`, fontWeight: 'bold' }}
                        onClick={() => alert(`Initiating return request of batch ${item.batchNumber} to supplier ${item.supplier}`)}
                      >
                        Return Batch
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Review Prescription Dialog */}
      <Dialog open={!!selectedPrescription} onClose={() => setSelectedPrescription(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Prescription Audit Review — {selectedPrescription?.id}</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Patient Details</Typography>
            <Typography variant="body1" fontWeight="bold">{selectedPrescription?.patientName} (Tel: {selectedPrescription?.phone})</Typography>
            <Typography variant="caption" color="text.secondary">Uploaded on: {selectedPrescription?.uploadDate}</Typography>
          </Box>
          <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, mb: 3, fontFamily: 'Courier New', borderStyle: 'dashed' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 'bold' }}>RX DIGITALIZATION PREVIEW</Typography>
            <Typography variant="body2">{selectedPrescription?.imageMock}</Typography>
          </Paper>
          {selectedPrescription?.notes && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Patient Notes</Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{selectedPrescription.notes}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => selectedPrescription && handleVerifyStatus(selectedPrescription.id, 'REJECTED')}
            disabled={selectedPrescription?.status !== 'PENDING'}
            sx={{ borderRadius: `${radius - 4}px`, fontWeight: 'bold' }}
          >
            Reject RX
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => selectedPrescription && handleVerifyStatus(selectedPrescription.id, 'VERIFIED', 'Dr. A. K. Roy')}
            disabled={selectedPrescription?.status !== 'PENDING'}
            sx={{ borderRadius: `${radius - 4}px`, fontWeight: 'bold' }}
          >
            Approve & Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PharmacyPrescriptions;
