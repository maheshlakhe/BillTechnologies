import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const RetailPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'retail')!;
    return <IndustryLayout config={config} />;
};

export default RetailPage;
