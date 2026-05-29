import React from 'react';
import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  BillSize,
  InvoiceTemplate
} from '../core';
import TemplateCard from './TemplateCard';
import {
  Folder as FolderIcon,
  ExpandMore,
} from '@mui/icons-material';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

interface FilterSidebarProps {
  selectedSize: BillSize | '';
  filteredTemplates: InvoiceTemplate[];
  activeFormat: string;
  handleTemplateSelect: (id: string) => void;
  setActiveFormat: (id: string) => void;
  onPreviewClick: (template: InvoiceTemplate) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedSize,
  filteredTemplates,
  activeFormat,
  handleTemplateSelect,
  setActiveFormat,
  onPreviewClick
}) => {
  // Group templates by Folder -> Subfolder
  const folders = filteredTemplates.reduce((acc, t) => {
    const f = t.folder || 'Other';
    const sf = t.subfolder || 'General';
    if (!acc[f]) acc[f] = {};
    if (!acc[f][sf]) acc[f][sf] = [];
    acc[f][sf].push(t);
    return acc;
  }, {} as Record<string, Record<string, InvoiceTemplate[]>>);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflow: 'hidden',
      bgcolor: '#fff' 
    }}>
      <Box sx={{ 
        px: 3, 
        py: 2.5, 
        borderBottom: '1px solid rgba(0,0,0,0.06)', 
        bgcolor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="subtitle2" fontWeight="950" sx={{ color: '#1e293b', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Template Explorer
        </Typography>
        <Chip 
          label={`${filteredTemplates.length} Designs`} 
          size="small" 
          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#f1f5f9', color: '#64748b' }} 
        />
      </Box>

      <Box className="custom-scrollbar" sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
        {Object.entries(folders).map(([folderName, subfolders]) => (
          <Accordion key={folderName} defaultExpanded disableGutters sx={{ 
            boxShadow: 'none', 
            '&:before': { display: 'none' },
            mb: 1,
            borderRadius: '12px !important',
            border: '1px solid rgba(0,0,0,0.04)',
            overflow: 'hidden',
            background: '#f8fafc'
          }}>
            <AccordionSummary 
              expandIcon={<ExpandMore sx={{ fontSize: '1.2rem', color: '#64748b' }} />} 
              sx={{ 
                minHeight: 48, 
                px: 2,
                '&.Mui-expanded': { minHeight: 48, bgcolor: 'rgba(59, 130, 246, 0.04)' } 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: 28, 
                  height: 28, 
                  borderRadius: 1, 
                  bgcolor: '#fff', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
                }}>
                  <FolderIcon sx={{ fontSize: '1rem', color: '#3b82f6' }} />
                </Box>
                <Typography variant="body2" fontWeight="800" sx={{ color: '#334155' }}>
                  {folderName}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {Object.entries(subfolders).map(([subfolderName, templates]) => (
                <Box key={subfolderName} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pl: 1 }}>
                    <Box sx={{ width: 4, height: 14, bgcolor: '#94a3b8', borderRadius: 4 }} />
                    <Typography variant="caption" fontWeight="900" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {subfolderName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {templates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isActive={template.id === activeFormat}
                        onClick={() => {
                          handleTemplateSelect(template.id);
                          setActiveFormat(template.id);
                        }}
                        onSelect={handleTemplateSelect}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}

        {filteredTemplates.length === 0 && (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" fontWeight="600">No matching templates.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FilterSidebar;
