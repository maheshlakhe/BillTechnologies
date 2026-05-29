import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

interface ReportBarProps {
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onExport: () => void;
  exportLabel?: string;
  showSearch?: boolean;
  dateOptions?: { value: string; label: string }[];
  actionButton?: React.ReactNode;
}

/**
 * ReportBar Component
 * A reusable horizontal bar for reports and expense modules.
 * Includes Date Range Selector, Search Input, and Export Button.
 */
export const ReportFilterBar: React.FC<ReportBarProps> = ({
  dateRange,
  onDateRangeChange,
  searchQuery = '',
  onSearchChange,
  onExport,
  exportLabel = 'Export',
  showSearch = true,
  dateOptions,
  actionButton
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const defaultDateOptions = [
    { value: 'last7', label: 'Last 7 days' },
    { value: 'last30', label: 'Last 30 days' },
    { value: 'last90', label: 'Last 90 days' },
    { value: 'last12', label: 'Last 12 months' },
    { value: 'all', label: 'All time' },
  ];

  const options = dateOptions || defaultDateOptions;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2 },
        mb: 3,
        borderRadius: 3,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2,
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        background: isDark
          ? 'linear-gradient(135deg, rgba(30,30,45,0.8), rgba(20,20,35,0.9))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.06)',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
        }
      }}
    >
      {/* Left: Search */}
      {showSearch && onSearchChange && (
        <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', md: 260 }, maxWidth: { md: 360 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                },
                transition: 'all 0.2s ease',
              }
            }}
          />
        </Box>
      )}

      {/* Right: Controls */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto',
          flexShrink: 0,
        }}
      >
        <TextField
          select
          size="small"
          label="Date Range"
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          sx={{ minWidth: { xs: '100%', md: 170 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarIcon sx={{ fontSize: 17, color: 'primary.main' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              },
            }
          }}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
          onClick={onExport}
          fullWidth={isMobile}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            height: 40,
            boxShadow: 'none',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            '&:hover': {
              boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {exportLabel}
        </Button>

        {actionButton}
      </Box>
    </Paper>
  );
};

export default ReportFilterBar;
