/* eslint-disable */
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  alpha,
  useTheme,
  Tab,
  Tabs,
  Badge,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as StudentIcon,
  Description as DocIcon,
  Add as AddIcon,
  AssignmentTurnedIn as VerifyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowForward as NextIcon,
  ArrowBack as PrevIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Cancel as ErrorIcon,
  Payment as MoneyIcon,
  SettingsVoice as VoiceIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { useIndustryLayout } from '../hooks/useIndustryLayout';
import { formatCurrency } from '../utils/currency';

interface IntakeRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  qualification: string;
  status: 'Draft' | 'Inquiry' | 'Counseling' | 'Documents Pending' | 'Verification' | 'Payment Pending' | 'Enrolled';
  guardianName: string;
  counselorNotes: string;
  paymentStatus: 'Pending' | 'Paid' | 'Partial';
  applicationFee: number;
}

export const EducationIntake: React.FC = () => {
  const theme = useTheme();
  const { showSuccess, showWarning, showError } = useNotification();
  const { layout: industryConf } = useIndustryLayout();
  const accent = industryConf.themeStyle.primaryAccent || '#6366f1';
  const radius = industryConf.themeStyle.borderRadius || 10;

  const [activeTab, setActiveTab] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<IntakeRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Default Mock Records for Education
  const [records, setRecords] = useState<IntakeRecord[]>([
    {
      id: 'INT-9021',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul.kumar@gmail.com',
      phone: '9812345601',
      course: 'Computer Science & AI',
      batch: 'Morning Batch A',
      qualification: 'Higher Secondary (12th)',
      status: 'Verification',
      guardianName: 'Sanjay Kumar',
      counselorNotes: 'Candidate is very eager about coding. High performance in maths.',
      paymentStatus: 'Paid',
      applicationFee: 2500,
    },
    {
      id: 'INT-9022',
      firstName: 'Sneha',
      lastName: 'Patel',
      email: 'sneha.patel@yahoo.com',
      phone: '9812345602',
      course: 'MBA Data Analytics',
      batch: 'Evening Weekend Batch',
      qualification: 'B.Sc Computer Science',
      status: 'Counseling',
      guardianName: 'Rajesh Patel',
      counselorNotes: 'Wants to pivot to Business Intelligence roles.',
      paymentStatus: 'Pending',
      applicationFee: 3000,
    },
    {
      id: 'INT-9023',
      firstName: 'Aman',
      lastName: 'Singh',
      email: 'aman.singh@outlook.com',
      phone: '9812345603',
      course: 'Digital Marketing UX',
      batch: 'Morning Batch A',
      qualification: 'Commerce Graduate',
      status: 'Payment Pending',
      guardianName: 'Jaswant Singh',
      counselorNotes: 'Interested in creative design and ad copy writing.',
      paymentStatus: 'Partial',
      applicationFee: 1500,
    },
    {
      id: 'INT-9024',
      firstName: 'Pooja',
      lastName: 'Mehta',
      email: 'pooja.mehta@gmail.com',
      phone: '9812345604',
      course: 'Full Stack Web Dev',
      batch: 'Hybrid Evening Batch',
      qualification: 'B.Tech Mechanical',
      status: 'Enrolled',
      guardianName: 'Harish Mehta',
      counselorNotes: 'Already paid first term fee. Onboarded to LMS.',
      paymentStatus: 'Paid',
      applicationFee: 5000,
    },
    {
      id: 'INT-9025',
      firstName: 'Vikram',
      lastName: 'Chawla',
      email: 'vikram.c@gmail.com',
      phone: '9812345605',
      course: 'Cloud Engineering & DevOps',
      batch: 'Weekend Batch B',
      qualification: 'Diploma CSE',
      status: 'Inquiry',
      guardianName: 'Ajay Chawla',
      counselorNotes: 'Inquired via website. Callback scheduled.',
      paymentStatus: 'Pending',
      applicationFee: 0,
    }
  ]);

  // Stepper Fields State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    address: '',
    city: '',
    state: '',
    highestQualification: '12th Pass',
    schoolCollege: '',
    boardUniversity: '',
    percentage: '',
    course: 'Computer Science & AI',
    batch: 'Morning Batch A',
    learningMode: 'Hybrid',
    guardianName: '',
    relation: 'Father',
    guardianPhone: '',
    documentType: 'Aadhaar Card',
    applicationFee: '1500',
    paymentMethod: 'UPI',
    counselorNotes: ''
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const startNewIntake = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'Male',
      dob: '',
      address: '',
      city: '',
      state: '',
      highestQualification: '12th Pass',
      schoolCollege: '',
      boardUniversity: '',
      percentage: '',
      course: 'Computer Science & AI',
      batch: 'Morning Batch A',
      learningMode: 'Hybrid',
      guardianName: '',
      relation: 'Father',
      guardianPhone: '',
      documentType: 'Aadhaar Card',
      applicationFee: '1500',
      paymentMethod: 'UPI',
      counselorNotes: ''
    });
    setActiveStep(0);
    setWizardOpen(true);
  };

  const handleStepNext = () => {
    if (activeStep === 4) {
      // Save
      const newRecord: IntakeRecord = {
        id: 'INT-' + Math.floor(9000 + Math.random() * 1000),
        firstName: formData.firstName || 'Anonymous',
        lastName: formData.lastName || 'Student',
        email: formData.email || 'student@domain.com',
        phone: formData.phone || '9999999999',
        course: formData.course,
        batch: formData.batch,
        qualification: formData.highestQualification,
        status: 'Inquiry',
        guardianName: formData.guardianName || 'Parent Guardian',
        counselorNotes: formData.counselorNotes || 'First session log',
        paymentStatus: 'Paid',
        applicationFee: Number(formData.applicationFee) || 1500
      };
      setRecords([newRecord, ...records]);
      showSuccess(`Intake application generated successfully: ${newRecord.id}`);
      setWizardOpen(false);
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const changeStatus = (id: string, newStatus: IntakeRecord['status']) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
    showSuccess(`Application ${id} status updated to: ${newStatus}`);
  };

  const metrics = useMemo(() => {
    return {
      total: records.length,
      counseling: records.filter(r => r.status === 'Counseling').length,
      verifying: records.filter(r => r.status === 'Verification').length,
      enrolled: records.filter(r => r.status === 'Enrolled').length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (activeTab === 0) return records; // All
    if (activeTab === 1) return records.filter(r => r.status === 'Inquiry' || r.status === 'Counseling');
    if (activeTab === 2) return records.filter(r => r.status === 'Verification' || r.status === 'Documents Pending');
    return records.filter(r => r.status === 'Enrolled');
  }, [records, activeTab]);

  return (
    <Box sx={{ p: 1 }}>
      {/* Title block */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: 'Outfit, sans-serif' }} gutterBottom>
            Student Intake & Counseling Hub
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage inquiries, student counseling workflows, document verification, and academic admissions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: accent,
            borderRadius: `${radius}px`,
            '&:hover': { bgcolor: alpha(accent, 0.85) }
          }}
          onClick={startNewIntake}
        >
          New Admission Intake
        </Button>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Inquiries', val: metrics.total, desc: 'Registered applicants', color: '#6366f1', icon: <StudentIcon /> },
          { title: 'In Counseling', val: metrics.counseling, desc: 'Interviews in progress', color: '#f59e0b', icon: <VoiceIcon /> },
          { title: 'Document Verification', val: metrics.verifying, desc: 'Pending verification checks', color: '#3b82f6', icon: <DocIcon /> },
          { title: 'Enrolled Students', val: metrics.enrolled, desc: 'Admissions confirmed', color: '#10b981', icon: <VerifyIcon /> },
        ].map((m, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card sx={{ borderRadius: `${radius}px`, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha(m.color, 0.1), color: m.color, width: 48, height: 48 }}>
                  {m.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
                    {m.val}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    {m.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {m.desc}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Application Logs and Tabs */}
      <Paper sx={{ borderRadius: `${radius}px`, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
        >
          <Tab label="All Intake Applications" />
          <Tab label="Inquiries & Counseling" />
          <Tab label="Verification Board" />
          <Tab label="Admissions Confirmed" />
        </Tabs>

        <TableContainer sx={{ minHeight: 350 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Intake ID</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Course Preference</TableCell>
                <TableCell>Highest Qualification</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Fee Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{row.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha(accent, 0.1), color: accent, fontSize: '0.85rem', width: 32, height: 32 }}>
                        {row.firstName.charAt(0)}{row.lastName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {row.firstName} {row.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {row.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">{row.course}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.batch}</Typography>
                  </TableCell>
                  <TableCell>{row.qualification}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status}
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        bgcolor:
                          row.status === 'Enrolled' ? alpha('#10b981', 0.1) :
                          row.status === 'Verification' ? alpha('#3b82f6', 0.1) :
                          row.status === 'Counseling' ? alpha('#f59e0b', 0.1) : 'action.selected',
                        color:
                          row.status === 'Enrolled' ? '#10b981' :
                          row.status === 'Verification' ? '#3b82f6' :
                          row.status === 'Counseling' ? '#f59e0b' : 'text.primary'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.paymentStatus}
                      color={row.paymentStatus === 'Paid' ? 'success' : row.paymentStatus === 'Partial' ? 'warning' : 'error'}
                      variant="outlined"
                      sx={{ fontWeight: 'bold', fontSize: '0.65rem', height: 20 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedRecord(row);
                        setDetailOpen(true);
                      }}
                      sx={{ mr: 1, borderRadius: `${radius - 4}px` }}
                    >
                      Process Intake
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Stepper Wizard Dialog */}
      <Dialog open={wizardOpen} onClose={() => setWizardOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>New Instructional Intake Wizard</DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {['Basic Details', 'Academics', 'Course Info', 'Guardian', 'Verification & Fees'].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Email Address" name="email" value={formData.email} onChange={handleInputChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Contact Mobile" name="phone" value={formData.phone} onChange={handleInputChange} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth size="small" multiline rows={2} label="Permanent Address" name="address" value={formData.address} onChange={handleInputChange} />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Highest Qualification</InputLabel>
                  <Select name="highestQualification" value={formData.highestQualification} label="Highest Qualification" onChange={handleInputChange}>
                    <MenuItem value="10th Pass">10th Class</MenuItem>
                    <MenuItem value="12th Pass">Higher Secondary (12th)</MenuItem>
                    <MenuItem value="Undergraduate">Undergraduate Degree</MenuItem>
                    <MenuItem value="Postgraduate">Postgraduate Degree</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="School / College Name" name="schoolCollege" value={formData.schoolCollege} onChange={handleInputChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Board / University" name="boardUniversity" value={formData.boardUniversity} onChange={handleInputChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Percentage / CGPA Marks" name="percentage" value={formData.percentage} onChange={handleInputChange} />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Course Preference</InputLabel>
                  <Select name="course" value={formData.course} label="Select Course Preference" onChange={handleInputChange}>
                    <MenuItem value="Computer Science & AI">Computer Science & AI</MenuItem>
                    <MenuItem value="MBA Data Analytics">MBA Data Analytics</MenuItem>
                    <MenuItem value="Digital Marketing UX">Digital Marketing UX</MenuItem>
                    <MenuItem value="Full Stack Web Dev">Full Stack Web Dev</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Preferred Batch</InputLabel>
                  <Select name="batch" value={formData.batch} label="Preferred Batch" onChange={handleInputChange}>
                    <MenuItem value="Morning Batch A">Morning Batch A (9:00 AM - 12:00 PM)</MenuItem>
                    <MenuItem value="Evening Weekend Batch">Evening Weekend (5:00 PM - 8:00 PM)</MenuItem>
                    <MenuItem value="Hybrid Evening Batch">Hybrid Evening (6:30 PM - 9:30 PM)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Learning Mode</InputLabel>
                  <Select name="learningMode" value={formData.learningMode} label="Learning Mode" onChange={handleInputChange}>
                    <MenuItem value="Online">Online Sessions</MenuItem>
                    <MenuItem value="Offline">Offline Classroom</MenuItem>
                    <MenuItem value="Hybrid">Hybrid/Blended Model</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {activeStep === 3 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Parent/Guardian Name" name="guardianName" value={formData.guardianName} onChange={handleInputChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Relation" name="relation" value={formData.relation} onChange={handleInputChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Guardian Phone" name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} />
              </Grid>
            </Grid>
          )}

          {activeStep === 4 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Document Type</InputLabel>
                  <Select name="documentType" value={formData.documentType} label="Document Type" onChange={handleInputChange}>
                    <MenuItem value="Aadhaar Card">Aadhaar Card (National ID)</MenuItem>
                    <MenuItem value="12th Marksheet">12th Marksheet Copy</MenuItem>
                    <MenuItem value="College Degree">Graduation Certificate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Admission Application Fee" name="applicationFee" value={formData.applicationFee} onChange={handleInputChange} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth size="small" multiline rows={3} label="Counselor Assessment Notes" name="counselorNotes" value={formData.counselorNotes} onChange={handleInputChange} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWizardOpen(false)} color="inherit">Cancel</Button>
          <Box sx={{ flexGrow: 1 }} />
          {activeStep > 0 && <Button onClick={handleStepBack} startIcon={<PrevIcon />}>Previous</Button>}
          <Button
            variant="contained"
            endIcon={activeStep === 4 ? <SuccessIcon /> : <NextIcon />}
            sx={{ bgcolor: accent, '&:hover': { bgcolor: alpha(accent, 0.85) } }}
            onClick={handleStepNext}
          >
            {activeStep === 4 ? 'Confirm & File Intake' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Processing Action Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        {selectedRecord && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SchoolIcon sx={{ color: accent }} />
              Process Application: {selectedRecord.id}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>STUDENT INFO</Typography>
              <Typography variant="body1" fontWeight="bold">{selectedRecord.firstName} {selectedRecord.lastName}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedRecord.email} | {selectedRecord.phone}</Typography>
              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>COURSE & ACADEMICS</Typography>
              <Typography variant="body2"><strong>Applied Course:</strong> {selectedRecord.course}</Typography>
              <Typography variant="body2"><strong>Assigned Batch:</strong> {selectedRecord.batch}</Typography>
              <Typography variant="body2"><strong>Qualification:</strong> {selectedRecord.qualification}</Typography>
              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>COUNSELOR ASSESSMENT NOTES</Typography>
              <Typography variant="body2" sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1, fontStyle: 'italic' }}>
                "{selectedRecord.counselorNotes || 'No notes added yet'}"
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>WORKFLOW ACTION WORKSPACE</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button size="small" variant="contained" color="warning" onClick={() => { changeStatus(selectedRecord.id, 'Counseling'); setDetailOpen(false); }}>
                  Schedule Counseling
                </Button>
                <Button size="small" variant="contained" color="info" onClick={() => { changeStatus(selectedRecord.id, 'Verification'); setDetailOpen(false); }}>
                  Verify Documents
                </Button>
                <Button size="small" variant="contained" color="success" onClick={() => { changeStatus(selectedRecord.id, 'Enrolled'); setDetailOpen(false); }}>
                  Enroll & Generate ID
                </Button>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailOpen(false)} color="inherit">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EducationIntake;
