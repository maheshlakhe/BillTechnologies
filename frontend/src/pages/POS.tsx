/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  InputBase,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Stack,
  useTheme
} from '@mui/material';
import { Search as SearchIcon, FileDownload as DownloadIcon } from '@mui/icons-material';
import { useBills } from '../hooks/useBills';
import { exportBillHistory } from '../utils/exportUtils';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { useIndustryLayout } from '../hooks/useIndustryLayout';

const SalesTransactions: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const { bills, loadBillsPaginated, loading, deleteBill } = useBills();
  const { layout: industryConf } = useIndustryLayout();
  const navigate = useNavigate();

  useEffect(() => {
    loadBillsPaginated({ page: 1, limit: 100, search: searchTerm });
  }, [searchTerm, loadBillsPaginated]);

  const handleExport = () => {
    if (bills.length > 0) exportBillHistory(bills);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusChip = (status: string) => {
    const s = (status || '').toUpperCase();
    const map: Record<string, { label: string; color: string; bg: string }> = {
      PAID:           { label: 'PAID',     color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
      PENDING_APPROVAL: { label: 'PAID',   color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
      PENDING:        { label: 'PENDING',  color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
      OVERDUE:        { label: 'OVERDUE',  color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
      FAILED:         { label: 'FAILED',   color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)'  },
      CANCELLED:      { label: 'CANCELLED',color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)'  },
      REFUNDED:       { label: 'REFUNDED', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
      DRAFT:          { label: 'DRAFT',    color: theme.palette.text.secondary, bg: 'rgba(100, 116, 139, 0.1)' },
    };
    const style = map[s] || { label: s, color: theme.palette.text.secondary, bg: 'rgba(100, 116, 139, 0.1)' };
    return (
      <Chip
        label={style.label}
        sx={{
          bgcolor: style.bg,
          color: style.color,
          fontWeight: 800,
          fontSize: '0.65rem',
          letterSpacing: '0.5px',
          height: 22,
          borderRadius: 1,
          '& .MuiChip-label': { px: 1 }
        }}
      />
    );
  };

  // Column header cell style
  const thStyle = {
    fontWeight: 800,
    color: theme.palette.text.secondary,
    fontSize: '0.65rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    py: 1.5,
    px: 2,
    borderBottom: '1px solid #F1F5F9',
    whiteSpace: 'nowrap' as const,
  };

  // Body cell style
  const tdStyle = {
    py: 1.5,
    px: 2,
    fontSize: '0.85rem',
    color: theme.palette.text.primary,
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    borderBottom: '1px solid #F8FAFC',
  };

  return (
    <Box sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC', minHeight: 'calc(100vh - 64px)', p: { xs: 2, md: 3 }, m: -3 }}>

      {/* ── Header ─────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px', fontFamily: 'Outfit, sans-serif', mb: 0.3 }}
          >
            Sales Transactions
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            View and manage all recent billing invoices.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Search */}
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.6,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              width: 240,
              bgcolor: '#fff',
              '&:focus-within': { borderColor: '#2563EB', boxShadow: '0 0 0 3px rgba(37,99,235,0.08)' },
              transition: 'all 0.2s'
            }}
          >
            <SearchIcon sx={{ color: '#CBD5E1', mr: 1, fontSize: 18 }} />
            <InputBase
              placeholder="Search Invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1, fontSize: '0.85rem', color: '#0F172A', fontWeight: 500 }}
            />
          </Paper>

          {/* Export button */}
          <Button
            variant="contained"
            startIcon={<DownloadIcon sx={{ fontSize: 17 }} />}
            onClick={handleExport}
            sx={{
              bgcolor: '#0F172A',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              py: 0.9,
              fontSize: '0.85rem',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: theme.palette.text.primary, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
            }}
          >
            Export Report
          </Button>
        </Stack>
      </Box>

      {/* ── Table Card ─────────────────────────── */}
      <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 700, tableLayout: 'fixed' }}>
            {/* Column widths */}
            {industryConf.isRestaurant ? (
              <colgroup>
                <col style={{ width: '15%' }} />   {/* Invoice */}
                <col style={{ width: '14%' }} />   {/* Table */}
                <col style={{ width: '12%' }} />   {/* Time */}
                <col style={{ width: '10%' }} />   {/* Items */}
                <col style={{ width: '12%' }} />   {/* Status */}
                <col style={{ width: '12%' }} />   {/* Amount */}
                <col style={{ width: '25%' }} />   {/* Action */}
              </colgroup>
            ) : industryConf.isPharmacy ? (
              <colgroup>
                <col style={{ width: '15%' }} />   {/* Invoice */}
                <col style={{ width: '15%' }} />   {/* Patient */}
                <col style={{ width: '15%' }} />   {/* Doctor */}
                <col style={{ width: '10%' }} />   {/* Time */}
                <col style={{ width: '8%' }} />    {/* Items */}
                <col style={{ width: '12%' }} />   {/* Status */}
                <col style={{ width: '10%' }} />   {/* Amount */}
                <col style={{ width: '15%' }} />   {/* Action */}
              </colgroup>
            ) : (
              <colgroup>
                <col style={{ width: '15%' }} />   {/* Invoice */}
                <col style={{ width: '20%' }} />   {/* Customer */}
                <col style={{ width: '12%' }} />   {/* Time */}
                <col style={{ width: '10%' }} />   {/* Items */}
                <col style={{ width: '12%' }} />   {/* Status */}
                <col style={{ width: '12%' }} />   {/* Amount */}
                <col style={{ width: '19%' }} />   {/* Action */}
              </colgroup>
            )}

            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={thStyle}>INVOICE ID</TableCell>
                {industryConf.isRestaurant && <TableCell sx={thStyle}>TABLE</TableCell>}
                {industryConf.isPharmacy && <TableCell sx={thStyle}>PATIENT</TableCell>}
                {industryConf.isPharmacy && <TableCell sx={thStyle}>DOCTOR</TableCell>}
                {!industryConf.isRestaurant && !industryConf.isPharmacy && <TableCell sx={thStyle}>CUSTOMER</TableCell>}
                <TableCell sx={thStyle}>TIME</TableCell>
                <TableCell sx={thStyle}>ITEMS</TableCell>
                <TableCell sx={{ ...thStyle, textAlign: 'center' }}>STATUS</TableCell>
                <TableCell sx={thStyle}>AMOUNT</TableCell>
                <TableCell sx={{ ...thStyle, textAlign: 'right' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={industryConf.isPharmacy ? 8 : 7} align="center" sx={{ py: 10, border: 0 }}>
                    <CircularProgress size={28} thickness={5} sx={{ color: '#2563EB' }} />
                  </TableCell>
                </TableRow>
              ) : bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={industryConf.isPharmacy ? 8 : 7} align="center" sx={{ py: 10, color: theme.palette.text.secondary, fontWeight: 500, border: 0 }}>
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => (
                  <TableRow
                    key={bill.id}
                    hover
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC' }, '&:last-child td': { border: 0 } }}
                    onClick={() => navigate(`/bills/view/${bill.id}`)}
                  >
                    <TableCell sx={{ ...tdStyle, fontWeight: 800 }}>
                      #{bill.billNumber || bill.id.substring(0, 8).toUpperCase()}
                    </TableCell>
                    {industryConf.isRestaurant && (
                      <TableCell sx={{ ...tdStyle, color: theme.palette.text.secondary }}>
                        {(bill as any).customFields?.table_no ? `Table ${(bill as any).customFields.table_no}` : <span style={{ color: '#CBD5E1' }}>—</span>}
                      </TableCell>
                    )}
                    {industryConf.isPharmacy && (
                      <>
                        <TableCell sx={{ ...tdStyle, color: theme.palette.text.secondary }}>
                          {bill.customerName || 'Walk-in Patient'}
                        </TableCell>
                        <TableCell sx={{ ...tdStyle, color: theme.palette.text.secondary }}>
                          {(bill as any).doctorName || 'Self / General'}
                        </TableCell>
                      </>
                    )}
                    {!industryConf.isRestaurant && !industryConf.isPharmacy && (
                      <TableCell sx={{ ...tdStyle, color: theme.palette.text.secondary }}>
                        {bill.customerName || 'Walk-in'}
                      </TableCell>
                    )}
                    <TableCell sx={{ ...tdStyle, color: theme.palette.text.secondary }}>
                      {formatTime(bill.createdAt)}
                    </TableCell>
                    <TableCell sx={tdStyle}>
                      {(bill.items?.length || 0)} items
                    </TableCell>
                    <TableCell sx={{ ...tdStyle, textAlign: 'center' }}>
                      {getStatusChip(bill.status)}
                    </TableCell>
                    <TableCell sx={{ ...tdStyle, fontWeight: 800 }}>
                      {formatCurrency(bill.totalAmount)}
                    </TableCell>
                    <TableCell sx={{ ...tdStyle, textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/bills/view/${bill.id}`)}
                          sx={{
                            color: '#2563EB',
                            borderColor: 'rgba(37, 99, 235, 0.5)',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            letterSpacing: '0.5px',
                            px: 1.5,
                            borderRadius: 1.5,
                            '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.07)', borderColor: '#2563EB' }
                          }}
                        >
                          VIEW
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete invoice ${bill.billNumber || bill.id}?`)) {
                              try {
                                await deleteBill(bill.id);
                                loadBillsPaginated({ page: 1, limit: 100, search: searchTerm });
                              } catch (err: any) {
                                alert(err.message || 'Failed to delete bill');
                              }
                            }
                          }}
                          sx={{
                            color: '#EF4444',
                            borderColor: 'rgba(239, 68, 68, 0.5)',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            letterSpacing: '0.5px',
                            px: 1.5,
                            borderRadius: 1.5,
                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.07)', borderColor: '#EF4444' }
                          }}
                        >
                          DELETE
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SalesTransactions;

