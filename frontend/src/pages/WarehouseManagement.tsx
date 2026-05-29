import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Warehouse as WarehouseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import { useWarehouses } from '../hooks/useWarehouses';
import { Warehouse } from '../types/warehouse';
import { LoadingButton } from '@mui/lab';

const WarehouseManagement: React.FC = () => {
  const theme = useTheme();
  const { warehouses, createWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses();
  const [open, setOpen] = useState(false);
  const [editingWH, setEditingWH] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  const handleOpen = (wh?: Warehouse) => {
    if (wh) {
      setEditingWH(wh);
      setFormData({
        name: wh.name,
        address: wh.address || '',
        city: wh.city || '',
        isActive: wh.isActive
      });
    } else {
      setEditingWH(null);
      setFormData({ name: '', address: '', city: '', isActive: true });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingWH) {
        await updateWarehouse({ ...editingWH, ...formData });
      } else {
        await createWarehouse(formData);
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      await deleteWarehouse(id);
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="900" color="text.primary" sx={{ letterSpacing: '-1px' }}>
            Warehouse Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your physical storage locations and inventory distribution.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 'bold' }}
        >
          Add Warehouse
        </Button>
      </Box>

      <Grid container spacing={3}>
        {warehouses.map((wh) => (
          <Grid size={{ xs: 12, md: 4 }} key={wh.id}>
            <Card 
              sx={{ 
                borderRadius: 4, 
                border: '1px solid', 
                borderColor: 'divider',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                      <WarehouseIcon color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{wh.name}</Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {wh.isActive ? (
                          <ActiveIcon sx={{ fontSize: 14, color: 'success.main' }} />
                        ) : (
                          <InactiveIcon sx={{ fontSize: 14, color: 'error.main' }} />
                        )}
                        <Typography variant="caption" color={wh.isActive ? 'success.main' : 'error.main'} fontWeight="bold">
                          {wh.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(wh)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(wh.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>

                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {wh.address ? `${wh.address}, ${wh.city}` : 'No address specified'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">
          {editingWH ? 'Edit Warehouse' : 'Add New Warehouse'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Warehouse Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active Status"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSave}
            loading={saving}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Save Warehouse
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarehouseManagement;
