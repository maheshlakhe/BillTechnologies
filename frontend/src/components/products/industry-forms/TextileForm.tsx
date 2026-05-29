import React from 'react';
import { Stack } from '@mui/material';
import { GeneralSection } from '../sections/GeneralSection';
import { PriceSection } from '../sections/PriceSection';
import { InventorySection } from '../sections/InventorySection';


import { Product } from '../../../types/product';
import { IndustryField } from '../../../hooks/useIndustryFields';

interface IndustryFormProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  onChange: (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  industryName?: string;
  industryFields: IndustryField[];
  
  
}

export const TextileForm: React.FC<IndustryFormProps> = (props) => {
  return (
    <Stack spacing={3}>
      <GeneralSection formData={props.formData} setFormData={props.setFormData} onChange={props.onChange} industryFields={props.industryFields} />
      <PriceSection formData={props.formData} setFormData={props.setFormData} onChange={props.onChange} industryFields={props.industryFields} />
      <InventorySection formData={props.formData} setFormData={props.setFormData} onChange={props.onChange} industryFields={props.industryFields} />
      {/* Specialized Textile Logic: Size/Color matrix, fabric composition details */}
      
      
    </Stack>
  );
};




