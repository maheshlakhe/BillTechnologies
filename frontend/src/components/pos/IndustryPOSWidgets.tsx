import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Checkbox,
  alpha
} from '@mui/material';
import { IndustryPOSWidgetProps } from './types';

// ==========================================
// 1. ELECTRONICS WIDGETS
// ==========================================
export const ElectronicsWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="IMEI / SIM Number"
          placeholder="IMEI-9201..."
          value={props.imeiInput}
          onChange={(e) => props.setImeiInput(e.target.value)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Serial Number"
          placeholder="S/N: 890A..."
          value={props.serialInput}
          onChange={(e) => props.setSerialInput(e.target.value)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Warranty Period"
          value={props.warrantyPeriod}
          onChange={(e) => props.setWarrantyPeriod(e.target.value)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
    </Grid>
    <Box sx={{ mt: 1.5, display: 'flex', gap: 1.5 }}>
      <Button variant="outlined" size="small" sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => {
        props.setImeiInput('IMEI-' + Math.floor(Math.random() * 9000000 + 1000000));
        props.showSuccess('Simulated IMEI barcode scanned!');
      }}>Scan IMEI</Button>
      <Button variant="outlined" size="small" sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => {
        props.setSerialInput('SN-' + Math.floor(Math.random() * 900000 + 100000));
        props.showSuccess('Simulated Serial barcode scanned!');
      }}>Scan Serial</Button>
      <Button variant="contained" color="secondary" size="small" onClick={() => {
        props.showSuccess('AI Accessories recommended for Active Device!');
      }}>Add AMC Upsell</Button>
    </Box>
  </Box>
);

// ==========================================
// 2. TEXTILE / CLOTHING (APPAREL) WIDGETS
// ==========================================
export const TextileWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Clothing Variants and Fitting Ledger</Typography>
    <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
      <FormControl size="small" sx={{ width: 120, '& .MuiOutlinedInput-root': { bgcolor: 'divider', color: 'text.primary' } }}>
        <InputLabel sx={{ color: 'text.secondary' }}>Size</InputLabel>
        <Select value={props.selectedSize} onChange={(e) => props.setSelectedSize(e.target.value)} label="Size">
          <MenuItem value="S">Small (S)</MenuItem>
          <MenuItem value="M">Medium (M)</MenuItem>
          <MenuItem value="L">Large (L)</MenuItem>
          <MenuItem value="XL">Extra Large (XL)</MenuItem>
          <MenuItem value="XXL">Double Extra Large (XXL)</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ width: 120, '& .MuiOutlinedInput-root': { bgcolor: 'divider', color: 'text.primary' } }}>
        <InputLabel sx={{ color: 'text.secondary' }}>Color</InputLabel>
        <Select value={props.selectedColor} onChange={(e) => props.setSelectedColor(e.target.value)} label="Color">
          <MenuItem value="Crimson Red">Crimson Red</MenuItem>
          <MenuItem value="Deep Navy Blue">Deep Navy Blue</MenuItem>
          <MenuItem value="Forest Green">Forest Green</MenuItem>
          <MenuItem value="Classic Onyx Black">Classic Onyx Black</MenuItem>
          <MenuItem value="Pearl White">Pearl White</MenuItem>
        </Select>
      </FormControl>
      <Chip 
        label={props.trialRoomStatus === 'OCCUPIED' ? "🔴 Trial: Occupied" : "🟢 Trial: Available"} 
        onClick={() => {
          const next = props.trialRoomStatus === 'OCCUPIED' ? 'AVAILABLE' : 'OCCUPIED';
          props.setTrialRoomStatus(next);
          props.showSuccess(`Trial Room status changed to ${next}`);
        }}
        sx={{ bgcolor: 'action.hover', color: 'text.primary', border: 1, borderColor: 'divider', height: 32, cursor: 'pointer' }}
      />
    </Stack>
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" size="small" sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Added Matchmaking Apparel recommendations to sidebar!')}>Suggest Outfit</Button>
      <Button variant="outlined" size="small" sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Created duplicate variant bundle in cart!')}>Duplicate by Size</Button>
    </Stack>
  </Box>
);

// ==========================================
// 3. GROCERY WIDGETS
// ==========================================
export const GroceryWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 12, sm: 6 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            label="Weight Scale Input (g)"
            type="number"
            value={props.simulatedWeight}
            InputProps={{ readOnly: true, sx: { bgcolor: 'divider', color: 'text.primary' } }}
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
          />
          <Button variant="outlined" size="small" sx={{ color: 'success.light', borderColor: '#10B981' }} onClick={props.readSimulatedWeight}>Read Scale</Button>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControlLabel
          control={
            <Switch 
              checked={props.barcodeMode} 
              onChange={(e) => {
                props.setBarcodeMode(e.target.checked);
                props.showSuccess(`Fast Barcode Mode ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
              }} 
            />
          }
          label={<Typography variant="caption" sx={{ color: 'text.primary' }}>Fast Barcode Mode</Typography>}
        />
      </Grid>
    </Grid>
    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
      <Button variant="outlined" size="small" sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('All items validated against shelf MRP guidelines.')}>MRP Validation</Button>
      <Button variant="outlined" size="small" sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Auto-applied Kirana Super Saver daily promotional coupon!')}>Apply Daily Offer</Button>
    </Box>
  </Box>
);

// ==========================================
// 4. PHARMACY WIDGETS
// ==========================================
export const PharmacyWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="contained" color="error" size="small" fullWidth onClick={() => props.showWarning('Batch expiry scan initialized: 2 items expiring in 60 days!')}>
          Expiry Warnings
        </Button>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" color="primary" size="small" fullWidth onClick={() => props.showSuccess('No severe drug interactions detected in active cart items.')}>
          Drug Interaction Check
        </Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormControlLabel
          control={
            <Checkbox 
              checked={props.prescriptionVerified} 
              onChange={(e) => {
                props.setPrescriptionVerified(e.target.checked);
                props.showSuccess(e.target.checked ? 'Prescription verified!' : 'Prescription unverified');
              }} 
              sx={{ color: 'error.main', '&.Mui-checked': { color: 'error.main' } }}
            />
          }
          label={<Typography variant="caption" sx={{ color: 'text.secondary' }}>Prescription Checked</Typography>}
        />
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 5. RESTAURANT WIDGETS
// ==========================================
export const RestaurantWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'divider', color: 'text.primary' } }}>
          <InputLabel sx={{ color: 'text.secondary' }}>Table No.</InputLabel>
          <Select value={props.selectedTable} onChange={(e) => props.setSelectedTable(e.target.value)} label="Table No.">
            <MenuItem value="Table 1 (2 Seater)">Table 1 (2 Seater)</MenuItem>
            <MenuItem value="Table 2 (4 Seater)">Table 2 (4 Seater)</MenuItem>
            <MenuItem value="Table 3 (6 Seater)">Table 3 (6 Seater)</MenuItem>
            <MenuItem value="Table 4 (Cabin)">Table 4 (Cabin)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'divider', color: 'text.primary' } }}>
          <InputLabel sx={{ color: 'text.secondary' }}>Waiter Assigned</InputLabel>
          <Select value={props.selectedWaiter} onChange={(e) => props.setSelectedWaiter(e.target.value)} label="Waiter Assigned">
            <MenuItem value="Ramesh Kumar">Ramesh Kumar</MenuItem>
            <MenuItem value="Sunita Sharma">Sunita Sharma</MenuItem>
            <MenuItem value="John Doe">John Doe</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Cooking Instructions"
          placeholder="e.g. Extra spicy, no onions..."
          value={props.cookingInstructions}
          onChange={(e) => props.setCookingInstructions(e.target.value)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 6. CONSTRUCTION & HARDWARE WIDGETS
// ==========================================
export const ConstructionWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 6, sm: 4 }}>
        <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>Dynamic Contractor Ledger</Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Premium Builder Group</Typography>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('AI recommendation for matching cement grade applied!')}>
          AI Grade Match
        </Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Custom dynamic logistics shipping quote generated!')}>
          Generate Cargo Quote
        </Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 7. AUTOMOBILE WIDGETS
// ==========================================
export const AutomobileWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Chassis Number"
          placeholder="17-Digit VIN..."
          value={props.chassisNumber}
          onChange={(e) => props.setChassisNumber(e.target.value)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Service Advisor"
          value={props.serviceAdvisor}
          onChange={(e) => props.setServiceAdvisor(e.target.value)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Job card sync verified!')}>Sync Job Card</Button>
        <Button variant="contained" size="small" fullWidth color="secondary" onClick={() => props.showSuccess('Auto parts exchange offer calculated!')}>Calculate Exchange</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 8. SERVICES WIDGETS
// ==========================================
export const ServicesWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 6, sm: 4 }}>
        <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>Technician Booking</Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Anil Sharma (Senior Tech)</Typography>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Linked technician assignment to receipt!')}>Assign Tech</Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Annual Maintenance Contract (AMC) upsell added!')}>AMC Upsell</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 9. SUBSCRIPTION (SAAS) WIDGETS
// ==========================================
export const SubscriptionWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'divider', color: 'text.primary' } }}>
          <InputLabel sx={{ color: 'text.secondary' }}>SaaS Plan Type</InputLabel>
          <Select defaultValue="Monthly Pro" label="SaaS Plan Type">
            <MenuItem value="Monthly Pro">Monthly Pro</MenuItem>
            <MenuItem value="Annual Premium">Annual Premium</MenuItem>
            <MenuItem value="Enterprise Custom">Enterprise Custom</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('E-license key auto-generated and linked!')}>Generate License</Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="contained" color="secondary" size="small" fullWidth onClick={() => props.showSuccess('Mandatory SLA agreement verified!')}>Verify SLA Agreement</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 10. EDUCATION WIDGETS
// ==========================================
export const EducationWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Student ID / Roll No."
          placeholder="STU-9901"
          value={props.studentIdInput}
          onChange={(e) => props.setStudentIdInput(e.target.value)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Coaching Batch"
          value={props.educationBatch}
          onChange={(e) => props.setEducationBatch(e.target.value)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Coaching tuition schedule synced!')}>Sync Student Fees</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 11. REAL ESTATE WIDGETS
// ==========================================
export const RealEstateWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Property Plot/Apt No."
          placeholder="Flat 402-A..."
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Property registry fee ledger updated!')}>Registry Status</Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="contained" size="small" fullWidth color="secondary" onClick={() => props.showSuccess('AI Broker commission split applied!')}>AI Broker Commission</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 12. TRAVEL WIDGETS
// ==========================================
export const TravelWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Seat Allocation Preference"
          placeholder="Aisle 12B..."
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Seat arrangement synced!')}>Seat Chart</Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('AI Recommended travel dynamic insurance upsold!')}>Travel Insurance</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 13. EVENT MANAGEMENT WIDGETS
// ==========================================
export const EventWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Estimated Guest Count"
          placeholder="e.g. 250 Guests"
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Simulated food catalog calculated!')}>Catering Estimate</Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Simulated staging and decor plan finalized!')}>Stage Layout</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 14. GYM & FITNESS WIDGETS
// ==========================================
export const GymWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 6, sm: 4 }}>
        <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'divider', color: 'text.primary' } }}>
          <InputLabel sx={{ color: 'text.secondary' }}>Fitness Plan</InputLabel>
          <Select value={props.fitnessPlanType} onChange={(e) => props.setFitnessPlanType(e.target.value)} label="Fitness Plan">
            <MenuItem value="Annual Card">Annual Card</MenuItem>
            <MenuItem value="3-Month Cardio Pro">3-Month Cardio Pro</MenuItem>
            <MenuItem value="Weekly Guest Pass">Weekly Guest Pass</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Simulated BMI"
          value={props.simulatedBMI}
          onChange={(e) => props.setSimulatedBMI(e.target.value)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: 'success.light', borderColor: '#10B981' }} onClick={() => {
          props.setSimulatedBMI('22.8 Normal');
          props.showSuccess('Simulated Member BMI metrics updated!');
        }}>Update Member BMI</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 15. AGRICULTURE WIDGETS
// ==========================================
export const AgricultureWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'divider', color: 'text.primary' } }}>
          <InputLabel sx={{ color: 'text.secondary' }}>Soil Quality Grade</InputLabel>
          <Select defaultValue="Black Soil Alluvial" label="Soil Quality Grade">
            <MenuItem value="Black Soil Alluvial">Black Soil Alluvial</MenuItem>
            <MenuItem value="Red Loamy Soil">Red Loamy Soil</MenuItem>
            <MenuItem value="Sandy Clay">Sandy Clay</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('AI Fertilizer combination generated based on soil!')}>Fertilizer Rec</Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Simulated weather crop protection model active!')}>Crop Protection</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 16. MANUFACTURING WIDGETS
// ==========================================
export const ManufacturingWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Bill of Materials ID"
          placeholder="BOM-9210-9"
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Active materials check complete!')}>Verify Raw Materials</Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="contained" color="secondary" size="small" fullWidth onClick={() => props.showSuccess('Production scheduling queue updated!')}>Update Production Queue</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 17. JEWELLERY WIDGETS
// ==========================================
export const JewelleryWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Typography variant="body2" sx={{ color: '#FCD34D', mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>✨ Dynamic Karat and Making Fee Calculator</span>
      <strong style={{ color: 'success.light' }}>Live Rate: {props.formatCurrency(props.liveGoldRate)}/g</strong>
    </Typography>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 3 }}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Gold Weight (g)"
          value={props.goldWeightGrams}
          onChange={(e) => props.setGoldWeightGrams(parseFloat(e.target.value) || 0)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'divider', color: 'text.primary' } }}>
          <InputLabel sx={{ color: 'text.secondary' }}>Purity</InputLabel>
          <Select value={props.goldPurityKarat} onChange={(e) => props.setGoldPurityKarat(parseInt(e.target.value.toString()) || 22)} label="Purity">
            <MenuItem value={24}>24 Karat (99.9% Pure)</MenuItem>
            <MenuItem value={22}>22 Karat (91.6% Pure)</MenuItem>
            <MenuItem value={18}>18 Karat (75.0% Pure)</MenuItem>
            <MenuItem value={14}>14 Karat (58.3% Pure)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Making Charges (%)"
          value={props.makingChargesPercent}
          onChange={(e) => props.setMakingChargesPercent(parseFloat(e.target.value) || 0)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }} sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: 'success.light', borderColor: '#10B981' }} onClick={props.syncLiveGoldRate}>Sync Rate</Button>
        <Button variant="contained" size="small" fullWidth sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'background.paper' } }} onClick={() => props.showSuccess('Simulated Gold purity certification synced!')}>Hallmark Check</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 18. HARDWARE WIDGETS
// ==========================================
export const HardwareWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Machine/Tool Code"
          placeholder="TOOL-892A"
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => props.showSuccess('Industrial machine calibration check complete!')}>Calibrate Tool</Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="contained" color="secondary" size="small" fullWidth onClick={() => props.showSuccess('Sleek equipment installation ticket created!')}>Book Installation</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 19. DIGITAL PRODUCTS & SAAS WIDGETS
// ==========================================
export const DigitalProductsWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="SaaS License Key"
          value={props.digitalLicenseKey}
          onChange={(e) => props.setDigitalLicenseKey(e.target.value)}
          InputProps={{ sx: { bgcolor: 'divider', color: 'text.primary' } }}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ color: '#60A5FA', borderColor: '#3B82F6' }} onClick={() => {
          props.setDigitalLicenseKey('LIC-' + Math.floor(Math.random() * 900000 + 100000));
          props.showSuccess('Generated active SaaS license key!');
        }}>Generate License Key</Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button variant="contained" color="secondary" size="small" fullWidth onClick={() => props.showSuccess('License key auto-dispatched to client email!')}>Dispatch via Email</Button>
      </Grid>
    </Grid>
  </Box>
);

// ==========================================
// 20. FALLBACK / OTHER WIDGETS
// ==========================================
export const OtherWidgets: React.FC<IndustryPOSWidgetProps> = (props) => (
  <Box>
    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
      Add custom dynamic fields to products from the Product Management screen to track industry-specific properties here in real-time.
    </Typography>
  </Box>
);

// ==========================================
// MASTER DISTRIBUTED WIDGET ORCHESTRATOR
// ==========================================
export const IndustryPOSWidgets: React.FC<IndustryPOSWidgetProps> = (props) => {
  switch (props.activeIndustrySlug) {
    case 'electronics':
      return <ElectronicsWidgets {...props} />;
    case 'textile':
    case 'apparel':
    case 'clothing':
      return <TextileWidgets {...props} />;
    case 'grocery':
      return <GroceryWidgets {...props} />;
    case 'pharmacy':
      return <PharmacyWidgets {...props} />;
    case 'restaurant':
      return <RestaurantWidgets {...props} />;
    case 'construction':
      return <ConstructionWidgets {...props} />;
    case 'automobile':
      return <AutomobileWidgets {...props} />;
    case 'services':
      return <ServicesWidgets {...props} />;
    case 'subscription':
      return <SubscriptionWidgets {...props} />;
    case 'education':
      return <EducationWidgets {...props} />;
    case 'real-estate':
      return <RealEstateWidgets {...props} />;
    case 'travel':
      return <TravelWidgets {...props} />;
    case 'event-management':
      return <EventWidgets {...props} />;
    case 'gym':
      return <GymWidgets {...props} />;
    case 'agriculture':
      return <AgricultureWidgets {...props} />;
    case 'manufacturing':
      return <ManufacturingWidgets {...props} />;
    case 'jewellery':
      return <JewelleryWidgets {...props} />;
    case 'hardware':
      return <HardwareWidgets {...props} />;
    case 'digital-products':
      return <DigitalProductsWidgets {...props} />;
    default:
      return <OtherWidgets {...props} />;
  }
};
