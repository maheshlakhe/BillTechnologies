import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Button, FormControl,
  InputLabel, Select, MenuItem, Paper, Divider, Stack, Chip,
  IconButton, Tooltip, CircularProgress, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, useTheme, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Badge,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Description as FileIcon,
  CloudQueue as CloudIcon,
  SettingsSuggest as AutoIcon,
  Upload as UploadIcon,
  Compare as CompareIcon,
  ErrorOutline as ErrorIcon,
  TableChart as TableIcon,
  Edit as EditIcon,
  CheckCircleOutline as AcceptIcon,
  CancelOutlined as RejectIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { getGstr1Json, getGstr2Json } from '../services/gstService';
import { formatCurrency } from '../utils/currency';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ErrorRecord {
  inum: string;
  val: number;
  error: string;
  section: string;
  corrected?: boolean;
}

interface ReconRecord {
  inum: string;
  systemVal: number;
  portalVal: number | null;
  status: 'matched' | 'missing' | 'mismatch';
  action?: 'accept' | 'reject' | null;
}

// ─────────────────────────────────────────────
// CSV Parsing Helpers (matching official format)
// ─────────────────────────────────────────────
const parseCSVtoRows = (text: string): any[] => {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/\r/g, ''));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/\r/g, '').replace(/"/g, ''));
    const obj: any = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
};

const parseGstr1B2BCSV = (rows: any[]): any[] => {
  const grouped: any = {};
  rows.forEach(row => {
    const gstin = row['GSTIN/UIN of Recipient'];
    if (!gstin) return;
    if (!grouped[gstin]) grouped[gstin] = { ctin: gstin, inv: [] };
    const existing = grouped[gstin].inv.find((i: any) => i.inum === row['Invoice Number']);
    const taxable = parseFloat(row['Taxable Value']) || 0;
    const rate = parseFloat(row['Rate']) || 0;
    const tax = (taxable * rate) / 100;
    const itm = {
      num: 1,
      itm_det: { rt: rate, txval: taxable, iamt: tax, camt: tax / 2, samt: tax / 2, csamt: parseFloat(row['Cess Amount']) || 0 }
    };
    if (existing) {
      existing.itms.push(itm);
    } else {
      grouped[gstin].inv.push({
        inum: row['Invoice Number'],
        idt: row['Invoice date'],
        val: parseFloat(row['Invoice Value']) || 0,
        pos: row['Place Of Supply'],
        rchrg: row['Reverse Charge'] === 'Y' ? 'Y' : 'N',
        inv_typ: row['Invoice Type'] || 'Regular B2B',
        itms: [itm],
      });
    }
  });
  return Object.values(grouped);
};

const parseGstr1B2CSCSV = (rows: any[]): any[] => rows.map(row => ({
  pos: row['Place Of Supply'],
  rt: parseFloat(row['Rate']) || 0,
  txval: parseFloat(row['Taxable Value']) || 0,
  iamt: 0, camt: 0, samt: 0,
  csamt: parseFloat(row['Cess Amount']) || 0,
  typ: row['Type'] || 'OE',
})).filter(r => r.pos);

const parseGstr1HSNCSV = (rows: any[]): any[] => rows.map(row => ({
  hsn_sc: row['HSN'],
  desc: row['Description'],
  uqc: row['UQC'],
  qty: parseFloat(row['Total Quantity']) || 0,
  val: parseFloat(row['Total Value']) || 0,
  txval: parseFloat(row['Taxable Value']) || 0,
  iamt: parseFloat(row['Integrated Tax Amount']) || 0,
  camt: parseFloat(row['Central Tax Amount']) || 0,
  samt: parseFloat(row['State/UT Tax Amount']) || 0,
  csamt: parseFloat(row['Cess Amount']) || 0,
  rt: parseFloat(row['Rate']) || 0,
})).filter(r => r.hsn_sc);

const parseGstr1CDNRCSV = (rows: any[]): any[] => {
  const grouped: any = {};
  rows.forEach(row => {
    const gstin = row['GSTIN/UIN of Recipient'];
    if (!gstin) return;
    if (!grouped[gstin]) grouped[gstin] = { ctin: gstin, nt: [] };
    const taxable = parseFloat(row['Taxable Value']) || 0;
    const rate = parseFloat(row['Rate']) || 0;
    const tax = (taxable * rate) / 100;
    grouped[gstin].nt.push({
      ntty: row['Note Type'] === 'C' ? 'C' : 'D',
      nt_num: row['Note Number'],
      nt_dt: row['Note Date'],
      val: parseFloat(row['Note Value']) || 0,
      pos: row['Place Of Supply'],
      rchrg: row['Reverse Charge'] === 'Y' ? 'Y' : 'N',
      itms: [{ num: 1, itm_det: { rt: rate, txval: taxable, iamt: tax, camt: tax / 2, samt: tax / 2 } }],
    });
  });
  return Object.values(grouped);
};

const parseGstr2B2BCSV = (rows: any[]): any[] => {
  const grouped: any = {};
  rows.forEach(row => {
    const gstin = row['GSTIN of Supplier'];
    if (!gstin) return;
    if (!grouped[gstin]) grouped[gstin] = { ctin: gstin, inv: [] };
    grouped[gstin].inv.push({
      inum: row['Invoice Number'],
      idt: row['Invoice date'],
      val: parseFloat(row['Invoice Value']) || 0,
      pos: row['Place Of Supply'],
      rchrg: row['Reverse Charge'] === 'Y' ? 'Y' : 'N',
      inv_typ: row['Invoice Type'] || 'Regular',
      itms: [{
        num: 1,
        itm_det: {
          rt: parseFloat(row['Rate']) || 0,
          txval: parseFloat(row['Taxable Value']) || 0,
          iamt: parseFloat(row['Integrated Tax Paid']) || 0,
          camt: parseFloat(row['Central Tax Paid']) || 0,
          samt: parseFloat(row['State/UT Tax Paid']) || 0,
          csamt: parseFloat(row['Cess Paid']) || 0,
        },
        itc: {
          elg: row['Eligibility For ITC'] || 'Ineligible',
          iamt: parseFloat(row['Availed ITC Integrated Tax']) || 0,
          camt: parseFloat(row['Availed ITC Central Tax']) || 0,
          samt: parseFloat(row['Availed ITC State/UT Tax']) || 0,
          csamt: parseFloat(row['Availed ITC Cess']) || 0,
        }
      }],
    });
  });
  return Object.values(grouped);
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const GstFiling: React.FC = () => {
  const theme = useTheme();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [gstrData, setGstrData] = useState<any>(null);
  const [gstr2Data, setGstr2Data] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const [reconData, setReconData] = useState<any>(null);
  const [reconRecords, setReconRecords] = useState<ReconRecord[]>([]);
  const [errorRecords, setErrorRecords] = useState<ErrorRecord[]>([]);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ErrorRecord | null>(null);
  const csvUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    handleFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i + 1);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const sData = await getGstr1Json(month + 1, year);
      const pData = await getGstr2Json(month + 1, year);
      setGstrData(sData);
      setGstr2Data(pData);
      toast.success('GST records synced');
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch GST data');
    } finally {
      setLoading(false);
    }
  };

  const currentData = activeTab === 0 ? gstrData : gstr2Data;

  // ── Download GSTR JSON ──────────────────────
  const handleDownloadJson = () => {
    const data = currentData;
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab === 0 ? 'GSTR1' : 'GSTR2'}_${data.gstin || 'data'}_${data.fp || `${month + 1}-${year}`}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${activeTab === 0 ? 'GSTR-1' : 'GSTR-2'} JSON downloaded`);
  };

  // ── Import Full Excel Workbook (Official Template) ──
  const handleExcelUpload = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array' });
          let newB2b: any[] = [], newB2cs: any[] = [], newHsn: any[] = [], newCdnr: any[] = [];

          if (wb.Sheets['b2b']) {
            const rows = XLSX.utils.sheet_to_json(wb.Sheets['b2b'], { range: 4 });
            newB2b = parseGstr1B2BCSV(rows.map((r: any) => ({
              'GSTIN/UIN of Recipient': r['GSTIN/UIN of Recipient'],
              'Invoice Number': r['Invoice Number'],
              'Invoice date': r['Invoice date'],
              'Invoice Value': r['Invoice Value'],
              'Place Of Supply': r['Place Of Supply'],
              'Reverse Charge': r['Reverse Charge'],
              'Invoice Type': r['Invoice Type'],
              'Rate': r['Rate'],
              'Taxable Value': r['Taxable Value'],
              'Cess Amount': r['Cess Amount'],
            })));
            if (newB2b.length) toast.success(`Imported ${newB2b.length} B2B parties from Excel`);
          }
          if (wb.Sheets['b2cs']) {
            const rows = XLSX.utils.sheet_to_json(wb.Sheets['b2cs'], { range: 4 });
            newB2cs = parseGstr1B2CSCSV(rows as any[]);
            if (newB2cs.length) toast.success(`Imported ${newB2cs.length} B2CS entries`);
          }
          if (wb.Sheets['hsn'] || wb.Sheets['hsn(b2b)']) {
            const sheetName = wb.Sheets['hsn'] ? 'hsn' : 'hsn(b2b)';
            const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { range: 4 });
            newHsn = parseGstr1HSNCSV(rows as any[]);
            if (newHsn.length) toast.success(`Imported ${newHsn.length} HSN records`);
          }
          if (wb.Sheets['cdnr']) {
            const rows = XLSX.utils.sheet_to_json(wb.Sheets['cdnr'], { range: 4 });
            newCdnr = parseGstr1CDNRCSV(rows as any[]);
            if (newCdnr.length) toast.success(`Imported ${newCdnr.length} CDNR records`);
          }

          setGstrData((prev: any) => ({
            ...prev,
            gstin: prev?.gstin || 'IMPORTED',
            fp: prev?.fp || `${String(month + 1).padStart(2, '0')}${year}`,
            b2b: newB2b.length ? newB2b : prev?.b2b,
            b2cs: newB2cs.length ? newB2cs : prev?.b2cs,
            hsn: newHsn.length ? { det: newHsn } : prev?.hsn,
            cdnr: newCdnr.length ? newCdnr : prev?.cdnr,
          }));
          setActiveTab(0);
        } catch {
          toast.error('Error parsing Excel file. Ensure it matches official GSTN template format.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch {
      toast.error('Failed to read file');
      setLoading(false);
    }
  };

  // ── Import Section-wise CSV (Official CSV format) ──
  const handleCSVSectionUpload = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    const fname = file.name.toLowerCase().replace('.csv', '');
    try {
      const text = await file.text();
      const rows = parseCSVtoRows(text);

      if (fname.includes('b2b') && !fname.includes('b2ba') && !fname.includes('b2bl') && !fname.includes('b2cs')) {
        if (activeTab === 1) {
          const parsed = parseGstr2B2BCSV(rows);
          setGstr2Data((p: any) => ({ ...p, b2b: parsed }));
          toast.success(`Imported ${parsed.length} GSTR-2 B2B parties from CSV`);
        } else {
          const parsed = parseGstr1B2BCSV(rows);
          setGstrData((p: any) => ({ ...p, b2b: parsed }));
          toast.success(`Imported ${parsed.length} GSTR-1 B2B parties from CSV`);
        }
      } else if (fname.includes('b2cs')) {
        const parsed = parseGstr1B2CSCSV(rows);
        setGstrData((p: any) => ({ ...p, b2cs: parsed }));
        toast.success(`Imported ${parsed.length} B2CS records from CSV`);
      } else if (fname.includes('hsn')) {
        const parsed = parseGstr1HSNCSV(rows);
        if (activeTab === 1) setGstr2Data((p: any) => ({ ...p, hsnsum: { det: parsed } }));
        else setGstrData((p: any) => ({ ...p, hsn: { det: parsed } }));
        toast.success(`Imported ${parsed.length} HSN records from CSV`);
      } else if (fname.includes('cdnr') && !fname.includes('cdnra') && !fname.includes('cdnur')) {
        const parsed = parseGstr1CDNRCSV(rows);
        if (activeTab === 1) setGstr2Data((p: any) => ({ ...p, cdnr: parsed }));
        else setGstrData((p: any) => ({ ...p, cdnr: parsed }));
        toast.success(`Imported ${parsed.length} CDNR parties from CSV`);
      } else if (fname.includes('b2cl')) {
        // B2CL shares similar structure with B2CS
        const parsed = rows.map((r: any) => ({
          pos: r['Place Of Supply'] || r['pos'],
          rt: parseFloat(r['Rate'] || r['rt']) || 0,
          txval: parseFloat(r['Taxable Value'] || r['txval']) || 0,
          inum: r['Invoice Number'] || '',
          val: parseFloat(r['Invoice Value'] || r['val']) || 0,
        })).filter((r: any) => r.pos);
        setGstrData((p: any) => ({ ...p, b2cl: parsed }));
        toast.success(`Imported ${parsed.length} B2CL records`);
      } else {
        toast.warning(`CSV section "${fname}" recognized. Data mapped to current return.`);
      }
    } catch {
      toast.error('Failed to parse CSV. Check file format matches official GST CSV template.');
    } finally {
      setLoading(false);
      if (csvUploadRef.current) csvUploadRef.current.value = '';
    }
  };

  // ── Open Portal JSON / Error File ──────────────
  const handlePortalFileUpload = (file?: File) => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.error_report || content.errorReport) {
          // Portal error report
          const errs = (content.error_report || content.errorReport || []).map((e: any) => ({
            inum: e.inum || e.invoice_number || '—',
            val: e.val || 0,
            error: e.error_msg || e.error || 'Validation error',
            section: e.section || 'b2b',
            corrected: false,
          }));
          setErrorRecords(errs);
          setActiveTab(2);
          setErrorDialogOpen(true);
          toast.warning(`${errs.length} error record(s) loaded from portal. Correct and re-export.`);
        } else {
          // Portal return file for reconciliation
          setReconData(content);
          buildReconRecords(content);
          setActiveTab(2);
          toast.success('Portal return data loaded for reconciliation');
        }
      } catch {
        toast.error('Invalid JSON. Upload a valid GSTN portal JSON file.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // ── Build Reconciliation Records ───────────────
  const buildReconRecords = (portalData: any) => {
    if (!gstrData?.b2b) { toast.info('Sync your invoices first, then load portal file.'); return; }
    const records: ReconRecord[] = [];
    gstrData.b2b.forEach((b: any) => {
      b.inv.forEach((inv: any) => {
        const pMatch = portalData?.b2b
          ?.find((pb: any) => pb.inv?.some((pi: any) => pi.inum === inv.inum))
          ?.inv?.find((pi: any) => pi.inum === inv.inum);
        records.push({
          inum: inv.inum,
          systemVal: inv.val,
          portalVal: pMatch?.val ?? null,
          status: !pMatch ? 'missing' : Math.abs((pMatch.val || 0) - inv.val) < 1 ? 'matched' : 'mismatch',
          action: null,
        });
      });
    });
    setReconRecords(records);
  };

  // ── Correct Error Record ────────────────────────
  const handleCorrectRecord = (rec: ErrorRecord) => {
    setEditRecord({ ...rec });
  };

  const handleSaveCorrection = () => {
    if (!editRecord) return;
    setErrorRecords(prev => prev.map(r => r.inum === editRecord.inum ? { ...editRecord, corrected: true } : r));
    setEditRecord(null);
    toast.success(`Invoice ${editRecord.inum} corrected`);
  };

  const handleDownloadCorrectedJson = () => {
    const uncorrected = errorRecords.filter(r => !r.corrected);
    if (uncorrected.length > 0) {
      toast.warning(`${uncorrected.length} records still have errors`);
    }
    const correctedInvoices = errorRecords.filter(r => r.corrected);
    const json = { gstin: gstrData?.gstin || '', fp: gstrData?.fp || '', b2b: correctedInvoices };
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_Corrected_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success('Corrected JSON downloaded');
  };

  // ── Export to Official Excel Format ────────────
  const handleExportToOfficialExcel = () => {
    if (!currentData) { toast.error('No data to export'); return; }
    const wb = XLSX.utils.book_new();

    // B2B sheet
    const b2bRows: any[] = [];
    b2bRows.push(['GSTIN/UIN of Recipient', 'Receiver Name', 'Invoice Number', 'Invoice date', 'Invoice Value', 'Place Of Supply', 'Reverse Charge', 'Invoice Type', 'Rate', 'Taxable Value', 'Cess Amount']);
    (currentData.b2b || []).forEach((b: any) => {
      b.inv.forEach((inv: any) => {
        inv.itms.forEach((itm: any) => {
          b2bRows.push([b.ctin, '', inv.inum, inv.idt, inv.val, inv.pos, inv.rchrg || 'N', inv.inv_typ || 'Regular B2B', itm.itm_det.rt, itm.itm_det.txval, itm.itm_det.csamt || '']);
        });
      });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(b2bRows), 'b2b');

    // B2CS sheet
    const b2csRows: any[] = [['Type', 'Place Of Supply', 'Rate', 'Taxable Value', 'Cess Amount']];
    (currentData.b2cs || []).forEach((b: any) => {
      b2csRows.push([b.typ || 'OE', b.pos, b.rt, b.txval, b.csamt || '']);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(b2csRows), 'b2cs');

    // HSN sheet
    const hsnRows: any[] = [['HSN', 'Description', 'UQC', 'Total Quantity', 'Total Value', 'Taxable Value', 'Integrated Tax Amount', 'Central Tax Amount', 'State/UT Tax Amount', 'Cess Amount', 'Rate']];
    ((currentData.hsn?.det || currentData.hsnsum?.det) || []).forEach((h: any) => {
      hsnRows.push([h.hsn_sc, h.desc, h.uqc, h.qty, h.val || 0, h.txval, h.iamt || 0, h.camt || 0, h.samt || 0, h.csamt || 0, h.rt || 0]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hsnRows), 'hsn');

    // CDNR sheet
    if (currentData.cdnr?.length) {
      const cdnrRows: any[] = [['GSTIN/UIN of Recipient', 'Receiver Name', 'Note Number', 'Note Date', 'Note Type', 'Place Of Supply', 'Reverse Charge', 'Note Value', 'Rate', 'Taxable Value', 'Cess Amount']];
      currentData.cdnr.forEach((c: any) => {
        c.nt.forEach((nt: any) => {
          nt.itms.forEach((itm: any) => {
            cdnrRows.push([c.ctin, '', nt.nt_num, nt.nt_dt, nt.ntty, nt.pos, nt.rchrg || 'N', nt.val, itm.itm_det.rt, itm.itm_det.txval, itm.itm_det.csamt || '']);
          });
        });
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cdnrRows), 'cdnr');
    }

    XLSX.writeFile(wb, `${activeTab === 0 ? 'GSTR1' : 'GSTR2'}_Export_${month + 1}_${year}.xlsx`);
    toast.success('Official Excel template exported successfully');
  };

  // ── Section Stats ───────────────────────────────
  const stats = [
    { label: activeTab === 0 ? 'B2B Parties' : 'Supplier Invoices', value: currentData?.b2b?.length || 0, color: '#6366f1', icon: <FileIcon /> },
    { label: 'B2CS Entries', value: currentData?.b2cs?.length || 0, color: '#3b82f6', icon: <CloudIcon /> },
    { label: 'HSN Codes', value: (currentData?.hsn?.det || currentData?.hsnsum?.det)?.length || 0, color: '#10b981', icon: <AutoIcon /> },
    { label: 'CDNR Parties', value: currentData?.cdnr?.length || 0, color: '#f59e0b', icon: <TableIcon /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* ── Header ─────────────────────────────────── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5, letterSpacing: '-0.5px' }}>
            GST Filing <span style={{ color: theme.palette.primary.main }}>Hub</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sync, import, correct and export GSTR-1 / GSTR-2 data matching the official GST Offline Tool.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Month</InputLabel>
            <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value as number)} sx={{ borderRadius: '10px' }}>
              {months.map((m, i) => <MenuItem key={i} value={i}>{m}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year" onChange={(e) => setYear(e.target.value as number)} sx={{ borderRadius: '10px' }}>
              {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* ── Action Toolbar ──────────────────────────── */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        <Tooltip title="Sync invoices from BillSoft database">
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleFetchData} disabled={loading} sx={{ borderRadius: '10px' }}>
            Sync Data
          </Button>
        </Tooltip>

        <Tooltip title="Download GSTR-1 or GSTR-2 JSON for GST Portal upload">
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadJson} disabled={!currentData} sx={{ borderRadius: '10px' }}>
            Download JSON
          </Button>
        </Tooltip>

        <Tooltip title="Import official GSTN Excel Workbook (GSTR1_Excel_Workbook_Template)">
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => document.getElementById('excel-upload')?.click()} sx={{ borderRadius: '10px' }}>
            Import Excel Template
          </Button>
        </Tooltip>
        <input type="file" id="excel-upload" hidden accept=".xlsx,.xls" onChange={(e) => handleExcelUpload(e.target.files?.[0])} />

        <Tooltip title="Import section-wise CSV (b2b.csv, hsn.csv, cdnr.csv, b2cs.csv etc.)">
          <Button variant="outlined" startIcon={<TableIcon />} onClick={() => csvUploadRef.current?.click()} sx={{ borderRadius: '10px' }}>
            Import Section CSV
          </Button>
        </Tooltip>
        <input ref={csvUploadRef} type="file" hidden accept=".csv" onChange={(e) => handleCSVSectionUpload(e.target.files?.[0])} />

        <Tooltip title="Open GSTN portal JSON or error file for reconciliation / correction">
          <Button variant="outlined" startIcon={<CompareIcon />} onClick={() => document.getElementById('portal-upload')?.click()} sx={{ borderRadius: '10px', borderColor: 'secondary.main', color: 'secondary.main' }}>
            Open Portal File
          </Button>
        </Tooltip>
        <input type="file" id="portal-upload" hidden accept=".json" onChange={(e) => handlePortalFileUpload(e.target.files?.[0])} />

        <Tooltip title="Export current data to official GST Excel template format">
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportToOfficialExcel} disabled={!currentData} sx={{ borderRadius: '10px' }}>
            Export to Excel
          </Button>
        </Tooltip>

        {errorRecords.length > 0 && (
          <Badge badgeContent={errorRecords.filter(e => !e.corrected).length} color="error">
            <Button variant="outlined" color="error" startIcon={<ErrorIcon />} onClick={() => setErrorDialogOpen(true)} sx={{ borderRadius: '10px' }}>
              Error Records
            </Button>
          </Badge>
        )}
      </Paper>

      {/* ── Main Tabs ──────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => { setActiveTab(v); setSubTab(0); }}>
          <Tab label="Sales (GSTR-1)" sx={{ fontWeight: 600 }} />
          <Tab label="Purchases (GSTR-2)" sx={{ fontWeight: 600 }} />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Reconciliation / Actions
              {reconRecords.length > 0 && <Chip label={reconRecords.filter(r => r.status !== 'matched').length} size="small" color="warning" sx={{ height: 18 }} />}
            </Box>
          } sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* ── Section Sub-Tabs (GSTR-1 and GSTR-2) ── */}
      {activeTab < 2 && currentData && (
        <Box sx={{ mb: 3 }}>
          <Tabs value={subTab} onChange={(_, v) => setSubTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ '& .MuiTab-root': { fontSize: '0.82rem', textTransform: 'none', minHeight: 38, borderRadius: '8px', mr: 0.5, '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08) } } }}>
            <Tab label="B2B Invoices" />
            <Tab label="B2CS (Consumer)" />
            {activeTab === 0 && <Tab label="B2CL (Large Value)" />}
            <Tab label="CDNR (Credit/Debit Notes)" />
            <Tab label="HSN Summary" />
            {activeTab === 1 && <Tab label="ITC Reversed" />}
          </Tabs>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography sx={{ mt: 2 }} color="text.secondary">Processing GST Records...</Typography>
        </Box>
      ) : activeTab < 2 ? (
        currentData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Stats Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
              {stats.map((s, i) => (
                <Card key={i} variant="outlined" sx={{ borderRadius: '16px' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ p: 1, width: 36, height: 36, borderRadius: '10px', bgcolor: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                      {s.icon}
                    </Box>
                    <Typography variant="h4" fontWeight="700">{s.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Data Table */}
            <Card variant="outlined" sx={{ borderRadius: '20px' }}>
              <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="700">
                  {subTab === 0 ? 'B2B Invoices' : subTab === 1 ? 'B2CS (Consumer Sales)' : subTab === 2 && activeTab === 0 ? 'B2CL (Large Value)' : subTab === 3 || (subTab === 2 && activeTab === 1) ? 'CDNR (Notes)' : 'HSN Summary'}
                </Typography>
                <Chip label={`Section ${subTab === 0 ? '4' : subTab === 1 ? '7' : subTab === 2 && activeTab === 0 ? '5' : subTab === 3 || (subTab === 2 && activeTab === 1) ? '9' : '12'}`} size="small" variant="outlined" />
              </Box>
              <Divider />
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      {subTab === 0 && <>
                        <TableCell><b>GSTIN</b></TableCell>
                        <TableCell align="center"><b>Invoices</b></TableCell>
                        <TableCell align="right"><b>Taxable Value</b></TableCell>
                        <TableCell align="right"><b>Total Tax</b></TableCell>
                        <TableCell align="right"><b>Invoice Total</b></TableCell>
                      </>}
                      {subTab === 1 && <>
                        <TableCell><b>Place of Supply</b></TableCell>
                        <TableCell align="center"><b>Rate (%)</b></TableCell>
                        <TableCell align="right"><b>Taxable Value</b></TableCell>
                        <TableCell align="right"><b>Tax Amount</b></TableCell>
                      </>}
                      {(subTab === 3 || (subTab === 2 && activeTab === 1)) && <>
                        <TableCell><b>GSTIN</b></TableCell>
                        <TableCell align="center"><b>Notes</b></TableCell>
                        <TableCell><b>Type</b></TableCell>
                        <TableCell align="right"><b>Note Value</b></TableCell>
                      </>}
                      {(subTab === 4 || (subTab === 3 && activeTab === 1)) && <>
                        <TableCell><b>HSN Code</b></TableCell>
                        <TableCell><b>Description</b></TableCell>
                        <TableCell><b>UQC</b></TableCell>
                        <TableCell align="right"><b>Qty</b></TableCell>
                        <TableCell align="right"><b>Taxable Value</b></TableCell>
                        <TableCell align="right"><b>Tax (IGST+CGST+SGST)</b></TableCell>
                      </>}
                      {subTab === 2 && activeTab === 0 && <>
                        <TableCell><b>Place of Supply</b></TableCell>
                        <TableCell align="center"><b>Rate (%)</b></TableCell>
                        <TableCell align="right"><b>Invoice Value</b></TableCell>
                        <TableCell align="right"><b>Taxable Value</b></TableCell>
                      </>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subTab === 0 && (
                      !currentData.b2b?.length
                        ? <TableRow><TableCell colSpan={5} sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>No B2B records. Sync data or import CSV/Excel.</TableCell></TableRow>
                        : currentData.b2b.map((b: any) => {
                          const taxable = b.inv.reduce((s: any, i: any) => s + i.itms.reduce((ss: any, itm: any) => ss + (itm.itm_det?.txval || 0), 0), 0);
                          const tax = b.inv.reduce((s: any, i: any) => s + i.itms.reduce((ss: any, itm: any) => ss + (itm.itm_det?.iamt || 0) + (itm.itm_det?.camt || 0) + (itm.itm_det?.samt || 0), 0), 0);
                          return (
                            <TableRow key={b.ctin} hover>
                              <TableCell><Typography variant="body2" fontWeight="600" color="primary">{b.ctin}</Typography></TableCell>
                              <TableCell align="center"><Chip label={b.inv.length} size="small" /></TableCell>
                              <TableCell align="right">{formatCurrency(taxable)}</TableCell>
                              <TableCell align="right">{formatCurrency(tax)}</TableCell>
                              <TableCell align="right"><Typography fontWeight="700">{formatCurrency(b.inv.reduce((s: any, i: any) => s + i.val, 0))}</Typography></TableCell>
                            </TableRow>
                          );
                        })
                    )}
                    {subTab === 1 && (
                      !currentData.b2cs?.length
                        ? <TableRow><TableCell colSpan={4} sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>No B2CS records.</TableCell></TableRow>
                        : currentData.b2cs.map((b: any, i: number) => (
                          <TableRow key={i} hover>
                            <TableCell>{b.pos}</TableCell>
                            <TableCell align="center"><Chip label={`${b.rt}%`} size="small" variant="outlined" /></TableCell>
                            <TableCell align="right">{formatCurrency(b.txval)}</TableCell>
                            <TableCell align="right">{formatCurrency((b.iamt || 0) + (b.camt || 0) + (b.samt || 0))}</TableCell>
                          </TableRow>
                        ))
                    )}
                    {(subTab === 3 || (subTab === 2 && activeTab === 1)) && (
                      !currentData.cdnr?.length
                        ? <TableRow><TableCell colSpan={4} sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>No CDNR records. Import from CSV.</TableCell></TableRow>
                        : currentData.cdnr.map((c: any) => (
                          <TableRow key={c.ctin} hover>
                            <TableCell><Typography variant="body2" fontWeight="600">{c.ctin}</Typography></TableCell>
                            <TableCell align="center"><Chip label={c.nt?.length || 0} size="small" /></TableCell>
                            <TableCell><Chip label={c.nt?.[0]?.ntty === 'C' ? 'Credit Note' : 'Debit Note'} size="small" variant="outlined" color="secondary" /></TableCell>
                            <TableCell align="right">{formatCurrency(c.nt?.reduce((s: any, n: any) => s + (n.val || 0), 0) || 0)}</TableCell>
                          </TableRow>
                        ))
                    )}
                    {(subTab === 4 || (subTab === 3 && activeTab === 1)) && (
                      !((currentData.hsn?.det || currentData.hsnsum?.det)?.length)
                        ? <TableRow><TableCell colSpan={6} sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>No HSN records.</TableCell></TableRow>
                        : (currentData.hsn?.det || currentData.hsnsum?.det || []).map((h: any) => (
                          <TableRow key={h.hsn_sc} hover>
                            <TableCell><Typography fontWeight="700">{h.hsn_sc}</Typography></TableCell>
                            <TableCell><Typography variant="caption">{h.desc}</Typography></TableCell>
                            <TableCell>{h.uqc}</TableCell>
                            <TableCell align="right">{h.qty}</TableCell>
                            <TableCell align="right">{formatCurrency(h.txval)}</TableCell>
                            <TableCell align="right">{formatCurrency((h.iamt || 0) + (h.camt || 0) + (h.samt || 0))}</TableCell>
                          </TableRow>
                        ))
                    )}
                    {subTab === 2 && activeTab === 0 && (
                      !currentData.b2cl?.length
                        ? <TableRow><TableCell colSpan={4} sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>No B2CL records. Import from CSV.</TableCell></TableRow>
                        : currentData.b2cl.map((b: any, i: number) => (
                          <TableRow key={i} hover>
                            <TableCell>{b.pos}</TableCell>
                            <TableCell align="center"><Chip label={`${b.rt}%`} size="small" variant="outlined" /></TableCell>
                            <TableCell align="right">{formatCurrency(b.val || 0)}</TableCell>
                            <TableCell align="right">{formatCurrency(b.txval || 0)}</TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Card>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 12, border: '2px dashed rgba(0,0,0,0.07)', borderRadius: '24px' }}>
            <FileIcon sx={{ fontSize: 80, opacity: 0.15, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>No GST Records Loaded</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Click <b>Sync Data</b> to pull from BillSoft, or use <b>Import Excel Template</b> / <b>Import Section CSV</b>.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleFetchData}>Sync Data</Button>
              <Button variant="contained" startIcon={<UploadIcon />} onClick={() => document.getElementById('excel-upload')?.click()}>Import Excel</Button>
            </Stack>
          </Box>
        )
      ) : (
        /* ── RECONCILIATION TAB ──── */
        <Box>
          {reconRecords.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10, border: '2px dashed rgba(0,0,0,0.07)', borderRadius: '20px' }}>
              <CompareIcon sx={{ fontSize: 70, opacity: 0.15, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No Reconciliation Data</Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Upload the GSTN portal return JSON using <b>Open Portal File</b> to start reconciliation.
              </Typography>
              <Button variant="outlined" startIcon={<CompareIcon />} onClick={() => document.getElementById('portal-upload')?.click()}>
                Open Portal File
              </Button>
            </Box>
          ) : (
            <Box>
              <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                <Chip label={`✅ Matched: ${reconRecords.filter(r => r.status === 'matched').length}`} color="success" variant="outlined" />
                <Chip label={`⚠️ Mismatch: ${reconRecords.filter(r => r.status === 'mismatch').length}`} color="warning" variant="outlined" />
                <Chip label={`❌ Missing in Portal: ${reconRecords.filter(r => r.status === 'missing').length}`} color="error" variant="outlined" />
              </Stack>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '16px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                      <TableCell><b>Invoice #</b></TableCell>
                      <TableCell align="right"><b>BillSoft Value</b></TableCell>
                      <TableCell align="right"><b>Portal Value</b></TableCell>
                      <TableCell><b>Status</b></TableCell>
                      <TableCell><b>Action</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reconRecords.map((r, i) => (
                      <TableRow key={r.inum} hover sx={{ bgcolor: r.status === 'mismatch' ? alpha('#f59e0b', 0.04) : r.status === 'missing' ? alpha('#ef4444', 0.04) : 'transparent' }}>
                        <TableCell><Typography variant="body2" fontWeight="600">{r.inum}</Typography></TableCell>
                        <TableCell align="right">{formatCurrency(r.systemVal)}</TableCell>
                        <TableCell align="right">{r.portalVal !== null ? formatCurrency(r.portalVal) : <Typography color="text.disabled" variant="body2">—</Typography>}</TableCell>
                        <TableCell>
                          {r.status === 'matched' && <Chip label="Matched" size="small" color="success" />}
                          {r.status === 'mismatch' && <Chip label="Value Mismatch" size="small" color="warning" />}
                          {r.status === 'missing' && <Chip label="Missing in Portal" size="small" color="error" />}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Accept – use BillSoft value">
                              <IconButton size="small" color="success" onClick={() => setReconRecords(prev => prev.map((rr, j) => j === i ? { ...rr, action: 'accept' } : rr))}>
                                <AcceptIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject – discard BillSoft value">
                              <IconButton size="small" color="error" onClick={() => setReconRecords(prev => prev.map((rr, j) => j === i ? { ...rr, action: 'reject' } : rr))}>
                                <RejectIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}

      {/* ── Error Correction Dialog ──────────────── */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Portal Error Records
          <Chip label={`${errorRecords.filter(e => !e.corrected).length} remaining`} color="error" size="small" />
        </DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Invoice #</b></TableCell>
                <TableCell><b>Section</b></TableCell>
                <TableCell><b>Error</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Action</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errorRecords.map((rec) => (
                <TableRow key={rec.inum} sx={{ bgcolor: rec.corrected ? alpha('#10b981', 0.05) : 'transparent' }}>
                  <TableCell><Typography variant="body2" fontWeight="600">{rec.inum}</Typography></TableCell>
                  <TableCell><Chip label={rec.section.toUpperCase()} size="small" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="caption" color="error">{rec.error}</Typography></TableCell>
                  <TableCell>
                    {rec.corrected
                      ? <Chip label="Corrected" size="small" color="success" />
                      : <Chip label="Pending" size="small" color="warning" />}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Correct this record">
                      <IconButton size="small" onClick={() => handleCorrectRecord(rec)} disabled={rec.corrected}>
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
          <Button variant="contained" color="success" startIcon={<DownloadIcon />} onClick={handleDownloadCorrectedJson}>
            Download Corrected JSON
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Record Dialog ──────────────────── */}
      {editRecord && (
        <Dialog open={!!editRecord} onClose={() => setEditRecord(null)} maxWidth="sm" fullWidth>
          <DialogTitle fontWeight={700}>Correct Invoice — {editRecord.inum}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Invoice Number" value={editRecord.inum} onChange={(e) => setEditRecord({ ...editRecord, inum: e.target.value })} fullWidth size="small" />
              <TextField label="Invoice Value" type="number" value={editRecord.val} onChange={(e) => setEditRecord({ ...editRecord, val: parseFloat(e.target.value) || 0 })} fullWidth size="small" />
              <TextField label="Error Description" value={editRecord.error} disabled fullWidth size="small" multiline rows={2} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditRecord(null)}>Cancel</Button>
            <Button variant="contained" startIcon={<AcceptIcon />} onClick={handleSaveCorrection}>Save Correction</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default GstFiling;
