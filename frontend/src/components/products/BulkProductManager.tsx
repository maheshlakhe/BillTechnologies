/* eslint-disable */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  LinearProgress,
  Divider,
  useTheme,
  Chip,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  CloudDownload,
  CloudUpload,
} from '@mui/icons-material';
import { Product } from '../../types/product';
import { getProductService } from '../../infrastructure/DIContainer';
import { IProductService } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';
import { INDUSTRY_SAMPLES } from '../../constants/industrySamples';
import axios from 'axios';
import { API_URL } from '../../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BulkProductManagerProps {
  open: boolean;
  onClose: () => void;
  onBulkImport: (products: Product[]) => Promise<void>;
}

interface IndustryField {
  id: string;
  name: string;
  label: string;
  dataType: string;
}

const productService: IProductService = getProductService();
const CHUNK_SIZE = 50;

const BulkProductManager: React.FC<BulkProductManagerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // Dynamic Industries list & Selected template state
  const [industries, setIndustries] = useState<any[]>([]);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('');
  const [selectedIndustrySlug, setSelectedIndustrySlug] = useState<string>('');
  const [industryFields, setIndustryFields] = useState<IndustryField[]>([]);

  // Local state
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Progress state
  const [isImporting, setIsImporting] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopImportRef = useRef(false);

  const resetAllStates = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setParsedProducts([]);
    setValidationErrors([]);
    setProcessed(0);
    setTotal(0);
    setError(null);
    setIsImporting(false);
    setIsDone(false);
    setJobId(null);
    stopImportRef.current = false;
  }, []);

  // 1. Fetch all active industries on dialog mount
  useEffect(() => {
    if (!open) return;
    const fetchAllIndustries = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/industries`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data.success && res.data.industries) {
          setIndustries(res.data.industries);
          
          // Pre-select the user's active industry
          const userIndustry = res.data.industries.find((i: any) => i.id === user?.industryId || i.slug === user?.industry?.slug);
          if (userIndustry) {
            setSelectedIndustryId(userIndustry.id);
            setSelectedIndustrySlug(userIndustry.slug);
          } else if (res.data.industries.length > 0) {
            setSelectedIndustryId(res.data.industries[0].id);
            setSelectedIndustrySlug(res.data.industries[0].slug);
          }
        }
      } catch (err) {
        console.error('[BulkImport] Failed to fetch active industries:', err);
      }
    };
    fetchAllIndustries();
  }, [open, user]);

  // 2. Dynamically fetch industry fields when selected template is changed
  useEffect(() => {
    if (!selectedIndustryId) return;
    const fetchFieldsForSelected = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/industries/${selectedIndustryId}/fields/product`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data.success) {
          setIndustryFields(res.data.fields || []);
        }
      } catch (err) {
        console.error('[BulkImport] Failed to fetch selected industry fields:', err);
      }
    };
    fetchFieldsForSelected();
  }, [selectedIndustryId]);

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    const products: any[] = [];

    const colIdx = (names: string[]) => headers.findIndex(h => names.some(n => h.includes(n)));

    const nameIdx = colIdx(['name']);
    const priceIdx = colIdx(['price']);
    const descIdx = colIdx(['description', 'desc']);
    const stockIdx = colIdx(['stock', 'qty']);
    const taxIdx = colIdx(['tax']);
    const skuIdx = colIdx(['sku']);
    const minIdx = colIdx(['minstock', 'min stock']);

    // Map industry field indices
    const industryFieldIndices = industryFields.map((field: IndustryField) => ({
      name: field.name,
      index: headers.findIndex(h => h === field.label.toLowerCase() || h === field.name.toLowerCase())
    }));

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length < 2) continue;

      const product: any = {
        name: nameIdx >= 0 ? values[nameIdx] : '',
        description: descIdx >= 0 ? values[descIdx] : null,
        price: priceIdx >= 0 ? parseFloat(values[priceIdx]) || 0 : 0,
        stock: stockIdx >= 0 ? parseInt(values[stockIdx]) || 0 : 0,
        taxRate: taxIdx >= 0 ? parseFloat(values[taxIdx]) || 0 : 0,
        sku: skuIdx >= 0 ? values[skuIdx] : null,
        quantity: minIdx >= 0 ? parseInt(values[minIdx]) || 0 : 0,
        customFields: {}
      };

      // Add industry specific values
      industryFieldIndices.forEach(fi => {
        if (fi.index >= 0 && values[fi.index] !== undefined) {
          product.customFields[fi.name] = values[fi.index];
        }
      });

      products.push(product);
    }
    return products;
  };

  const downloadTemplate = () => {
    const baseHeaders = ['Name', 'Description', 'Price', 'Stock', 'Tax Rate (%)', 'SKU', 'Min Stock Level'];
    const customHeaders = industryFields.map((f: IndustryField) => f.label);
    const headers = [...baseHeaders, ...customHeaders];

    // Pick dynamic samples based on selected slug
    const sample = INDUSTRY_SAMPLES[selectedIndustrySlug] || INDUSTRY_SAMPLES['retail']; 
    
    const sampleRow = [
      sample.name || 'Sample Item',
      sample.description || 'Product Description',
      sample.price || '19.99',
      '50',
      '18',
      sample.sku || 'SKU123',
      '10',
      ...industryFields.map((f: IndustryField) => sample.customFields?.[f.name] || 'Sample Value')
    ];
    
    const csv = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_template_${selectedIndustrySlug}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const products = parseCSV(content);
      const errors: string[] = [];

      if (products.length === 0) errors.push('No valid product rows found in file.');
      if (products.some(p => !p.name)) errors.push('Some rows are missing the required "Name" field.');

      setParsedProducts(products);
      setValidationErrors(errors);
    };
    reader.readAsText(f);
  };

  const startImport = async () => {
    if (parsedProducts.length === 0 || validationErrors.length > 0) return;

    setIsImporting(true);
    setError(null);
    setIsDone(false);
    setProcessed(0);
    setTotal(parsedProducts.length);
    stopImportRef.current = false;

    try {
      const response = await productService.startChunkedImport(parsedProducts.length);
      const newJobId = response.jobId;
      setJobId(newJobId);

      const chunks: any[][] = [];
      for (let i = 0; i < parsedProducts.length; i += CHUNK_SIZE) {
        chunks.push(parsedProducts.slice(i, i + CHUNK_SIZE));
      }

      for (const chunk of chunks) {
        if (stopImportRef.current) {
          await productService.cancelImport(newJobId);
          break;
        }
        await productService.sendImportChunk(newJobId, chunk);
        setProcessed(prev => prev + chunk.length);
      }

      if (!stopImportRef.current) {
        setProcessed(parsedProducts.length);
        setIsDone(true);
        await productService.finishImportJob(newJobId, 'completed');
        setTimeout(() => {
          window.dispatchEvent(new Event('inventory-updated'));
          onClose();
          resetAllStates();
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.message || 'A network error occurred during import.');
      setIsImporting(false);
    }
  };

  const handleStopRequest = async () => {
    if (window.confirm('Cancel import? All progress in this session will be lost.')) {
      stopImportRef.current = true;
      if (jobId) await productService.cancelImport(jobId);
      setIsImporting(false);
      onClose();
      resetAllStates();
    }
  };

  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <Dialog open={open || isImporting} onClose={isImporting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">Dynamic Product Import</Typography>
        {industryFields.length > 0 && (
          <Chip label="Industry Specific Template" size="small" color="primary" variant="outlined" />
        )}
      </DialogTitle>

      <DialogContent dividers>
        {isImporting ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h5" color="primary" gutterBottom fontWeight="bold">{percentage}%</Typography>
            <LinearProgress variant="determinate" value={percentage} sx={{ height: 10, borderRadius: 5, mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Processed {processed} of {total} products
            </Typography>
            {isDone && <Alert severity="success" sx={{ mt: 3 }}>Import completed successfully!</Alert>}
          </Box>
        ) : (
          <Box py={1}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Select your targeted industry view to generate a customized Excel template. The importer dynamically maps specific database fields (like gold purity, engine numbers, or medicine types) automatically.
            </Alert>

            {/* Industry Selector Dropdown */}
            <Box mb={3}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
                1. Select Target Industry Template:
              </Typography>
              <FormControl fullWidth variant="outlined">
                <Select
                  value={selectedIndustryId}
                  onChange={(e) => {
                    const selectedId = e.target.value as string;
                    setSelectedIndustryId(selectedId);
                    const ind = industries.find((i: any) => i.id === selectedId);
                    if (ind) {
                      setSelectedIndustrySlug(ind.slug);
                    }
                  }}
                  sx={{ borderRadius: '8px' }}
                >
                  {industries.map((ind) => (
                    <MenuItem key={ind.id} value={ind.id}>
                      {ind.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Template Field Preview Tags */}
            {industryFields.length > 0 && (
              <Box mb={3} p={2.5} sx={{ bgcolor: 'action.hover', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={1.5}>
                  TEMPLATE LAYOUT SPECIFICATION:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {['Name', 'Description', 'Price', 'Stock', 'Tax Rate (%)', 'SKU', 'Min Stock Level'].map((col) => (
                    <Chip key={col} label={col} size="small" sx={{ fontWeight: 'bold' }} />
                  ))}
                  {industryFields.map((field) => (
                    <Chip key={field.id} label={`${field.label} (${field.dataType})`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 'medium' }} />
                  ))}
                </Box>
              </Box>
            )}

            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: 'text.primary' }}>
              2. Download and Fill Template:
            </Typography>
            <Box display="flex" gap={2} mb={4}>
              <Button variant="outlined" startIcon={<CloudDownload />} onClick={downloadTemplate} fullWidth sx={{ borderRadius: '8px', py: 1.25 }}>
                Download CSV Template
              </Button>
              <Button variant="contained" startIcon={<CloudUpload />} onClick={() => fileInputRef.current?.click()} fullWidth sx={{ borderRadius: '8px', py: 1.25 }}>
                {file ? 'Change Upload File' : 'Upload Filled CSV'}
              </Button>
              <input type="file" hidden ref={fileInputRef} accept=".csv" onChange={handleFileSelect} />
            </Box>

            {file && (
              <Box p={2} sx={{ bgcolor: 'success.soft', borderRadius: '8px', border: '1px solid', borderColor: validationErrors.length > 0 ? 'error.main' : 'success.main' }}>
                <Typography variant="subtitle2" fontWeight="bold">Selected File: {file.name}</Typography>
                {validationErrors.length > 0 ? (
                  <Alert severity="error" sx={{ mt: 1 }}>{validationErrors.join(', ')}</Alert>
                ) : (
                  <Alert severity="success" sx={{ mt: 1 }}>{parsedProducts.length} products mapped successfully & ready to import!</Alert>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {!isImporting ? (
          <>
            <Button onClick={onClose} sx={{ borderRadius: '6px' }}>Cancel</Button>
            <Button variant="contained" onClick={startImport} disabled={!file || validationErrors.length > 0} sx={{ borderRadius: '6px' }}>
              Start Import
            </Button>
          </>
        ) : !isDone && (
          <Button color="error" onClick={handleStopRequest} sx={{ borderRadius: '6px' }}>Stop Import</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkProductManager;
