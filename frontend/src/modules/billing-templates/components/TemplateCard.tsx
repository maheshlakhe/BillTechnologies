import React from 'react';
import {
  Typography,
  Box,
  Button,
  Chip,
  alpha
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  LocalShipping as DeliveryIcon,
  Receipt as TaxIcon,
  Handyman as ServiceIcon,
  Business as BusinessIcon,
  Autorenew as RecurringIcon,
  LocalHospital as MedicalIcon,
  AssignmentTurnedIn as ProjectIcon,
  School as SchoolIcon,
  Hotel as HotelIcon,
  Checkroom as FashionIcon,
  Devices as ElectronicsIcon,
  TextFields as CustomFieldIcon
} from '@mui/icons-material';
import { InvoiceTemplate } from '../core';
import { MOCK_BILL, MOCK_PO } from '../core/mockData';
import BillTemplateRenderer from '../BillTemplateRenderer';

interface TemplateCardProps {
  template: InvoiceTemplate;
  isActive: boolean;
  onSelect: (id: string) => void;
  onClick: () => void;
}



const TemplateCard: React.FC<TemplateCardProps> = ({ template, isActive, onSelect, onClick }) => {
  const themeColor = template.settings?.colorScheme || '#3B82F6';

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box sx={{ p: '0 !important', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
        <Box sx={{
          width: '100%',
          height: 240, // Fixed height for the card's preview area
          bgcolor: '#f1f5f9',
          borderRadius: 2.5,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          mb: 2,
          border: isActive ? `2px solid ${themeColor}` : '1px solid rgba(0,0,0,0.06)',
          boxShadow: isActive ? `0 12px 24px ${themeColor}20` : 'none',
          '&:hover': { transform: 'scale(1.02)', boxShadow: '0 15px 30px rgba(0,0,0,0.08)' }
        }}>
          {/* SCALED PREVIEW CONTAINER - EXACT FIDELITY */}
          <Box sx={{
            transform: template.settings.billSize === 'A4' ? 'scale(0.28)' : 
                       template.settings.billSize === 'A5' ? 'scale(0.4)' : 'scale(0.7)',
            transformOrigin: 'top center',
            width: template.settings.billSize === 'A4' ? '210mm' : 
                   template.settings.billSize === 'A5' ? '148mm' : '80mm',
            height: '1000px', // Large internal height to allow rendering, but parent will clip
            margin: '0 auto',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: isActive ? 1 : 0.85,
            filter: isActive ? 'none' : 'grayscale(0.1) opacity(0.8)',
          }}>
            <BillTemplateRenderer
              template={template}
              bill={template.id.includes('purchase_order') || template.id.includes('po_') ? MOCK_PO : MOCK_BILL}
              size={template.settings.billSize}
              billType={template.name}
            />
          </Box>
          
          {/* FADE OUT OVERLAY */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'linear-gradient(to top, rgba(241,245,249,1), rgba(241,245,249,0))',
            zIndex: 1
          }} />
        </Box>

        <Box sx={{ width: '100%', mb: 1.5, textAlign: 'left', px: 1 }}>
          <Typography variant="subtitle1" fontWeight="950" sx={{ color: '#1e293b', lineHeight: 1.2, mb: 0.5, fontSize: '0.9rem' }}>
            {template.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip label={template.settings.billSize} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900, bgcolor: '#f1f5f9' }} />
            <Chip label={`${template.settings.activeColumns?.length || 0} cols`} size="small" sx={{
              height: 16, fontSize: '0.6rem', fontWeight: 900,
              bgcolor: isActive ? `${themeColor}20` : '#f1f5f9',
              color: isActive ? themeColor : 'inherit'
            }} />
          </Box>
        </Box>

        <Button
          fullWidth
          variant={isActive ? "contained" : "outlined"}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(template.id);
          }}
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 900,
            py: 0.8,
            background: isActive ? themeColor : 'transparent',
            borderColor: isActive ? 'transparent' : 'rgba(0,0,0,0.15)',
            boxShadow: isActive ? `0 10px 20px ${themeColor}30` : 'none'
          }}
        >
          {isActive ? 'Active' : 'Select'}
        </Button>
      </Box>

      {isActive && (
        <Box sx={{
          position: 'absolute',
          top: -10,
          left: 10,
          bgcolor: themeColor,
          color: '#fff',
          px: 1,
          borderRadius: 1,
          fontSize: '0.55rem',
          fontWeight: 900,
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          zIndex: 1
        }}>
          ACTIVE
        </Box>
      )}
    </Box>
  );
};

export default TemplateCard;
