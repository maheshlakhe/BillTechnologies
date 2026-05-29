
import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  Checkbox,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { Bill } from '../../types/bill';
import { formatCompactCurrency } from '../../utils/currency';

interface VirtualizedBillListProps {
  bills: Bill[];
  onView: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, billId: string) => void;
  selectedIds: string[];
  onSelect: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  height: number;
  selectionMode: boolean;
  onSelectAll: (checked: boolean) => void;
}

/**
 * Bill List component using a standard Table with table-layout: fixed
 * This ensures perfect vertical alignment between headers and rows to meet enterprise standards.
 */
const VirtualizedBillList: React.FC<VirtualizedBillListProps> = ({
  bills,
  onView,
  onEdit,
  onMenuOpen,
  selectedIds,
  onSelect,
  canEdit,
  canDelete,
  height,
  selectionMode,
  onSelectAll
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'success';
      case 'PENDING_APPROVAL': return 'success';
      case 'PENDING': return 'warning';
      case 'OVERDUE': return 'error';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  // Define column widths - shared by header and body using fixed pixel values to match Product module
  const widths = {
    selection: '60px',
    billNumber: '180px',
    customer: '250px',
    amount: '150px',
    status: '150px',
    date: '150px',
    actions: '180px'
  };

  // Common padding and alignment for all cells - increased padding for better spacing
  const cellSx = {
    px: 3,
    py: 2, 
    textAlign: 'left',
    borderColor: 'divider',
    whiteSpace: 'nowrap',
    fontSize: '0.925rem'
  };

  const firstCellSx = {
    ...cellSx,
    pl: 3, // Increased padding
    paddingRight: '16px',
    flexGrow: 0,
    minWidth: '200px',
    maxWidth: '260px'
  };

  const selectionCellSx = {
    ...cellSx,
    pl: 2,
    minWidth: '60px',
    flexShrink: 0,
    flex: '0 0 auto'
  };

  return (
    <TableContainer component={Paper} sx={{ height, maxHeight: height, overflowX: 'auto', overflowY: 'auto', borderRadius: 2 }}>
      <Table stickyHeader sx={{ tableLayout: 'auto', minWidth: 1050 }}>
        <TableHead>
          <TableRow>
            {selectionMode ? (
              <>
                <TableCell sx={{ ...selectionCellSx, width: { xs: '10%', md: widths.selection }, textAlign: 'center' }}>
                  <Checkbox
                    size="small"
                    indeterminate={selectedIds.length > 0 && selectedIds.length < bills.length}
                    checked={bills.length > 0 && selectedIds.length === bills.length}
                    onChange={(e) => onSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell sx={{ ...firstCellSx, width: widths.billNumber }}>Bill #</TableCell>
              </>
            ) : (
              <TableCell sx={{ ...firstCellSx, width: widths.billNumber }}>Bill #</TableCell>
            )}
            <TableCell sx={{ ...cellSx, width: widths.customer }}>Customer</TableCell>
            <TableCell sx={{ ...cellSx, width: widths.amount }}>Amount</TableCell>
            <TableCell sx={{ ...cellSx, width: widths.status, textAlign: 'center' }}>Status</TableCell>
            <TableCell sx={{ ...cellSx, width: widths.date }}>Date</TableCell>
            <TableCell sx={{ ...cellSx, width: widths.actions, minWidth: 120, textAlign: 'right' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bills.map((bill) => {
            const isSelected = selectedIds.includes(bill.id);
            return (
              <TableRow 
                key={bill.id} 
                hover 
                selected={isSelected}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {selectionMode ? (
                  <>
                    <TableCell sx={{ ...selectionCellSx, textAlign: 'center' }}>
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={() => onSelect(bill.id)}
                      />
                    </TableCell>
                    <TableCell sx={firstCellSx}>
                      <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
                        <ReceiptIcon fontSize="small" color="action" sx={{ flexShrink: 0, width: '16px', height: '16px' }} />
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="primary"
                          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, whiteSpace: 'nowrap' }}
                          onClick={() => onView(bill.id)}
                        >
                          #{bill.billNumber || bill.id.slice(0, 8)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </>
                ) : (
                  <TableCell sx={firstCellSx}>
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
                      <ReceiptIcon fontSize="small" color="action" sx={{ flexShrink: 0, width: '16px', height: '16px' }} />
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="primary"
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, whiteSpace: 'nowrap' }}
                        onClick={() => onView(bill.id)}
                      >
                        #{bill.billNumber || bill.id.slice(0, 8)}
                      </Typography>
                    </Box>
                  </TableCell>
                )}

                {/* Customer Name */}
                <TableCell sx={cellSx}>
                  <Typography variant="body2" fontWeight="bold" noWrap>
                    {bill.customerName}
                  </Typography>
                </TableCell>

                {/* Total Amount */}
                <TableCell sx={cellSx}>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCompactCurrency(bill.totalAmount)}
                  </Typography>
                </TableCell>

                {/* Status */}
                <TableCell sx={{ ...cellSx, textAlign: 'center' }}>
                  <Chip
                    label={bill.status === 'PENDING_APPROVAL' ? 'PAID' : bill.status}
                    size="small"
                    color={getStatusColor(bill.status) as any}
                    variant="outlined"
                    sx={{ fontWeight: 600, minWidth: 80, fontSize: '0.8125rem' }}
                  />
                </TableCell>

                {/* Date */}
                <TableCell sx={cellSx}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell sx={{ ...cellSx, width: widths.actions, minWidth: 120, textAlign: 'right' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: { xs: 0, sm: 1 }, flexWrap: 'nowrap' }}>
                    <Tooltip title="View">
                      <IconButton size="small" color="primary" onClick={() => onView(bill.id)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canEdit && (
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit(bill)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <IconButton size="small" onClick={(e) => onMenuOpen(e, bill.id)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
          {bills.length === 0 && (
            <TableRow>
              <TableCell colSpan={selectionMode ? 7 : 6} sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No bills found matching your criteria.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VirtualizedBillList;
