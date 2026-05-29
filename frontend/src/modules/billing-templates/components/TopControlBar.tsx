import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  alpha,
  Stack
} from '@mui/material';
import {
  TableChart as TableChartIcon,
  Tune as TuneIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import {
  BillSize,
  SIZE_CONFIG,
} from '../core';

interface TopControlBarProps {
  selectedSize: BillSize | '';
  setSelectedSize: (val: BillSize | '') => void;
  availableSizes: BillSize[];
  lastSyncFailed: boolean;
  onRetrySync: () => void;
  onManageColumns: () => void;
  colInfo: {
    cols: string[];
    isOverridden: boolean;
  } | null;
}

const TopControlBar: React.FC<TopControlBarProps> = ({
  selectedSize,
  setSelectedSize,
  availableSizes,
  lastSyncFailed,
  onRetrySync,
  onManageColumns,
  colInfo
}) => {
  const sizeMeta = selectedSize ? SIZE_CONFIG[selectedSize] : null;

  return (
    <Box sx={{
      p: 1.5, 
      px: 3, 
      display: 'flex', 
      gap: 3, 
      alignItems: 'center',
      bgcolor: '#fff', 
      borderBottom: '1px solid rgba(0,0,0,0.08)', 
      flexWrap: 'nowrap',
      position: 'relative',
      zIndex: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
    }}>
      {/* BRANDING / TITLE */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 3, borderRight: '1px solid #e2e8f0' }}>
        <Box sx={{ 
          width: 36, 
          height: 36, 
          borderRadius: 2, 
          bgcolor: '#dc2626', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
        }}>
          <TableChartIcon sx={{ color: '#fff', fontSize: '1.2rem' }} />
        </Box>
        <Typography variant="h6" fontWeight="950" sx={{ color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '-0.5px', fontSize: '1.1rem' }}>
          Templates
        </Typography>
      </Box>

      {/* PAGE SIZE SELECTOR */}
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="size-select-label" sx={{ fontWeight: 700, color: '#64748b' }}>Page Size</InputLabel>
          <Select
            labelId="size-select-label"
            value={selectedSize}
            label="Page Size"
            onChange={(e) => setSelectedSize(e.target.value as BillSize)}
            sx={{ 
              borderRadius: 2, 
              bgcolor: '#f8fafc',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.08)' },
              fontWeight: 800,
              color: '#334155'
            }}
          >
            <MenuItem value=""><em>Select Size</em></MenuItem>
            {availableSizes.map(size => (
              <MenuItem key={size} value={size} sx={{ fontWeight: 600 }}>{size}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* COLUMN RANGE INDICATOR */}
        {selectedSize && sizeMeta && (
          <Chip
            icon={<InfoIcon sx={{ fontSize: '14px !important' }} />}
            label={`${sizeMeta.minCols} to ${sizeMeta.maxCols} cols allowed`}
            sx={{
              fontWeight: 800,
              px: 1,
              height: 36,
              fontSize: '0.75rem',
              border: '1px solid rgba(0,0,0,0.06)',
              bgcolor: '#fff',
              color: '#475569',
              '& .MuiChip-icon': { color: '#3b82f6' }
            }}
          />
        )}

        {colInfo && (
          <Chip
            label={`${colInfo.cols.length} Active`}
            sx={{
              fontWeight: 900,
              height: 36,
              px: 1,
              fontSize: '0.75rem',
              bgcolor: colInfo.isOverridden ? alpha('#10b981', 0.1) : '#1e293b',
              color: colInfo.isOverridden ? '#059669' : '#fff',
            }}
          />
        )}
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" spacing={1.5}>
        {lastSyncFailed && (
          <Button
            variant="contained"
            color="error"
            size="medium"
            startIcon={<TuneIcon />}
            onClick={onRetrySync}
            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', px: 3 }}
          >
            Retry Sync
          </Button>
        )}
        <Button
          variant="contained"
          size="medium"
          disabled={!selectedSize}
          onClick={onManageColumns}
          startIcon={<TableChartIcon />}
          sx={{ 
            borderRadius: 2, 
            fontWeight: 800, 
            px: 4,
            textTransform: 'none',
            bgcolor: '#1e293b',
            '&:hover': { bgcolor: '#0f172a' },
            boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)'
          }}
        >
          Manage Columns
        </Button>
      </Stack>
    </Box>
  );
};

export default TopControlBar;
