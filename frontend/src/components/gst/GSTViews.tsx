import React, { useMemo } from 'react';
import { 
  Box, Typography, Card, CardContent, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip
} from '@mui/material';
import { 
  TrendingUp, CurrencyRupee as IndianRupee, ShoppingCart, FileCopy 
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/currency';

// Shared formatting
const fmt = (val: number) => formatCurrency(val);

export const GSTDashboard = ({ invoices, purchases }: any) => {
  const activeInvoices = invoices.filter((i: any) => i.status === 'ACTIVE');
  const totalSales = activeInvoices.reduce((s: any, i: any) => s + i.invoice_value, 0);
  const totalTax = activeInvoices.reduce((s: any, i: any) => s + i.cgst_amount + i.sgst_amount + i.igst_amount, 0);
  const totalItc = purchases.reduce((s: any, p: any) => s + p.igst_amount + p.cgst_amount + p.sgst_amount, 0);
  const netPayable = totalTax - totalItc;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold">GST Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>GST return overview for current period</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {[
          { title: 'Total Sales', val: totalSales, sub: `${activeInvoices.length} invoices`, color: 'success.main', icon: <TrendingUp /> },
          { title: 'Tax Collected', val: totalTax, sub: 'CGST + SGST + IGST', color: 'primary.main', icon: <IndianRupee /> },
          { title: 'Input Tax Credit', val: totalItc, sub: `${purchases.length} purchases`, color: 'info.main', icon: <ShoppingCart /> },
          { title: 'Net Tax Payable', val: netPayable, sub: netPayable < 0 ? 'Refund claimable' : 'Due to govt', color: netPayable < 0 ? 'warning.main' : 'error.main', icon: <FileCopy /> }
        ].map((c, i) => (
          <Card key={i} variant="outlined" sx={{ borderLeft: `4px solid`, borderColor: c.color, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>{c.title}</Typography>
                  <Typography variant="h5" fontWeight="bold">{fmt(c.val)}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.sub}</Typography>
                </Box>
                <Box sx={{ color: c.color, opacity: 0.8, p: 1, bgcolor: `${c.color}15`, borderRadius: '50%' }}>
                  {c.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Recent Invoices</Typography>
            {activeInvoices.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No invoices yet.</Typography>
            ) : (
              activeInvoices.slice(-5).reverse().map((inv: any) => (
                <Box key={inv.invoice_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{inv.invoice_number}</Typography>
                    <Typography variant="caption" color="text.secondary">{inv.customer_name} • {inv.invoice_type}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" fontFamily="monospace">{fmt(inv.invoice_value)}</Typography>
                </Box>
              ))
            )}
          </Paper>
        <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Tax Breakdown</Typography>
            {[
              { label: 'CGST', val: activeInvoices.reduce((s: any, i: any) => s + i.cgst_amount, 0) },
              { label: 'SGST', val: activeInvoices.reduce((s: any, i: any) => s + i.sgst_amount, 0) },
              { label: 'IGST', val: activeInvoices.reduce((s: any, i: any) => s + i.igst_amount, 0) },
            ].map(t => (
              <Box key={t.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                <Typography variant="body2" color="text.secondary">{t.label}</Typography>
                <Typography variant="body2" fontWeight="bold" fontFamily="monospace">{fmt(t.val)}</Typography>
              </Box>
            ))}
          </Paper>
      </Box>
    </Box>
  );
};

export const GSTInvoices = ({ invoices }: any) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Sales Invoices</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Taxable Amount</TableCell>
              <TableCell align="right">Total Tax</TableCell>
              <TableCell align="right">Invoice Value</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>No invoices found</TableCell></TableRow>
            ) : invoices.map((inv: any) => (
              <TableRow key={inv.invoice_id} hover>
                <TableCell>{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{inv.invoice_number}</TableCell>
                <TableCell>{inv.customer_name}</TableCell>
                <TableCell><Chip size="small" label={inv.invoice_type} variant="outlined" /></TableCell>
                <TableCell align="right">{fmt(inv.taxable_value)}</TableCell>
                <TableCell align="right">{fmt(inv.cgst_amount + inv.sgst_amount + inv.igst_amount)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{fmt(inv.invoice_value)}</TableCell>
                <TableCell>
                  <Chip size="small" color={inv.status === 'ACTIVE' ? 'success' : 'error'} label={inv.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export const GSTPurchases = ({ purchases }: any) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Purchase Register</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>Supplier GSTIN</TableCell>
              <TableCell align="right">Taxable value</TableCell>
              <TableCell align="right">CGST</TableCell>
              <TableCell align="right">SGST</TableCell>
              <TableCell align="right">IGST</TableCell>
              <TableCell align="right">Total Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>No purchases found</TableCell></TableRow>
            ) : purchases.map((p: any) => (
              <TableRow key={p.purchase_id} hover>
                <TableCell>{new Date(p.invoice_date).toLocaleDateString()}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{p.invoice_number}</TableCell>
                <TableCell>{p.supplier_gstin}</TableCell>
                <TableCell align="right">{fmt(p.taxable_value)}</TableCell>
                <TableCell align="right">{fmt(p.cgst_amount)}</TableCell>
                <TableCell align="right">{fmt(p.sgst_amount)}</TableCell>
                <TableCell align="right">{fmt(p.igst_amount)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {fmt(p.taxable_value + p.cgst_amount + p.sgst_amount + p.igst_amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export const GSTR1Report = ({ invoices }: any) => {
  const activeInvoices = invoices.filter((i: any) => i.status === 'ACTIVE');
  
  const b2b = activeInvoices.filter((i: any) => i.invoice_type === 'B2B');
  const b2cs = activeInvoices.filter((i: any) => i.invoice_type === 'B2C_SMALL');
  const hsnSummary = useMemo(() => {
    const summary = new Map();
    activeInvoices.forEach((inv: any) => {
      inv.items?.forEach((item: any) => {
        const key = item.hsn_code;
        if (!summary.has(key)) summary.set(key, { hsn: key, quantity: 0, taxable: 0, taxAmount: 0 });
        const existing = summary.get(key);
        existing.quantity += item.quantity;
        existing.taxable += item.taxable_value;
        existing.taxAmount += item.cgst_amount + item.sgst_amount + item.igst_amount;
      });
    });
    return Array.from(summary.values());
  }, [activeInvoices]);

  const SummaryTable = ({ title, data, renderRow }: any) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{title}</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Count/ID</TableCell>
              <TableCell align="right">Taxable</TableCell>
              <TableCell align="right">Tax Amt</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No data</TableCell></TableRow>
            ) : data.map((d: any, i: number) => renderRow(d, i))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>GSTR-1 Summary</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Details of outward supplies of goods or services.</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
          <SummaryTable 
            title="B2B Supplies (Table 4A, 4B, 4C, 6B, 6C)" 
            data={[{
              count: b2b.length,
              taxable: b2b.reduce((s: any, i: any) => s + i.taxable_value, 0),
              tax: b2b.reduce((s: any, i: any) => s + i.cgst_amount + i.sgst_amount + i.igst_amount, 0),
              total: b2b.reduce((s: any, i: any) => s + i.invoice_value, 0)
            }]} 
            renderRow={(d: any, i: number) => (
              <TableRow key={i}>
                <TableCell>{d.count} Invoices</TableCell>
                <TableCell align="right">{fmt(d.taxable)}</TableCell>
                <TableCell align="right">{fmt(d.tax)}</TableCell>
                <TableCell align="right">{fmt(d.total)}</TableCell>
              </TableRow>
            )} 
          />
          <SummaryTable 
            title="B2C Small Supplies (Table 7)" 
            data={[{
              count: b2cs.length,
              taxable: b2cs.reduce((s: any, i: any) => s + i.taxable_value, 0),
              tax: b2cs.reduce((s: any, i: any) => s + i.cgst_amount + i.sgst_amount + i.igst_amount, 0),
              total: b2cs.reduce((s: any, i: any) => s + i.invoice_value, 0)
            }]} 
            renderRow={(d: any, i: number) => (
              <TableRow key={i}>
                <TableCell>{d.count} Invoices</TableCell>
                <TableCell align="right">{fmt(d.taxable)}</TableCell>
                <TableCell align="right">{fmt(d.tax)}</TableCell>
                <TableCell align="right">{fmt(d.total)}</TableCell>
              </TableRow>
            )} 
          />
      </Box>
      
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, mt: 2 }}>HSN/SAC Summary (Table 12)</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>HSN Code</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Taxable</TableCell>
              <TableCell align="right">Total Tax</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hsnSummary.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No data</TableCell></TableRow>
            ) : hsnSummary.map((hsn: any) => (
              <TableRow key={hsn.hsn}>
                <TableCell>{hsn.hsn}</TableCell>
                <TableCell align="right">{hsn.quantity}</TableCell>
                <TableCell align="right">{fmt(hsn.taxable)}</TableCell>
                <TableCell align="right">{fmt(hsn.taxAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export const GSTR3BReport = ({ invoices, purchases }: any) => {
  const activeInvoices = invoices.filter((i: any) => i.status === 'ACTIVE');
  
  const outwardSupply = {
    taxable: activeInvoices.reduce((s: any, i: any) => s + i.taxable_value, 0),
    cgst: activeInvoices.reduce((s: any, i: any) => s + i.cgst_amount, 0),
    sgst: activeInvoices.reduce((s: any, i: any) => s + i.sgst_amount, 0),
    igst: activeInvoices.reduce((s: any, i: any) => s + i.igst_amount, 0),
  };

  const itc = {
    cgst: purchases.reduce((s: any, p: any) => s + p.cgst_amount, 0),
    sgst: purchases.reduce((s: any, p: any) => s + p.sgst_amount, 0),
    igst: purchases.reduce((s: any, p: any) => s + p.igst_amount, 0),
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>GSTR-3B Summary</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Monthly return summarizing outward supplies and ITC.</Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>3.1 Details of Outward Supplies</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>Nature of Supply</TableCell>
                    <TableCell align="right">Taxable</TableCell>
                    <TableCell align="right">CGST</TableCell>
                    <TableCell align="right">SGST</TableCell>
                    <TableCell align="right">IGST</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>(a) Outward taxable supplies</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{fmt(outwardSupply.taxable)}</TableCell>
                    <TableCell align="right">{fmt(outwardSupply.cgst)}</TableCell>
                    <TableCell align="right">{fmt(outwardSupply.sgst)}</TableCell>
                    <TableCell align="right">{fmt(outwardSupply.igst)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>4. Eligible ITC</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">CGST</TableCell>
                    <TableCell align="right">SGST</TableCell>
                    <TableCell align="right">IGST</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>(A) ITC Available (All other ITC)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>{fmt(itc.cgst)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>{fmt(itc.sgst)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>{fmt(itc.igst)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Paper variant="outlined" sx={{ p: 3, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Net Tax Liability / Claim</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
              <Box>
                 <Typography color="text.secondary">Net CGST</Typography>
                 <Typography variant="h6" color={outwardSupply.cgst - itc.cgst < 0 ? 'success.main' : 'error.main'}>
                   {fmt(outwardSupply.cgst - itc.cgst)}
                 </Typography>
              </Box>
              <Box>
                 <Typography color="text.secondary">Net SGST</Typography>
                 <Typography variant="h6" color={outwardSupply.sgst - itc.sgst < 0 ? 'success.main' : 'error.main'}>
                   {fmt(outwardSupply.sgst - itc.sgst)}
                 </Typography>
              </Box>
              <Box>
                 <Typography color="text.secondary">Net IGST</Typography>
                 <Typography variant="h6" color={outwardSupply.igst - itc.igst < 0 ? 'success.main' : 'error.main'}>
                   {fmt(outwardSupply.igst - itc.igst)}
                 </Typography>
              </Box>
            </Box>
          </Paper>
      </Box>
    </Box>
  );
};
