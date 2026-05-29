import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const GroceryPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'grocery')!;
    return <IndustryLayout config={config} />;
};

export default GroceryPage;
