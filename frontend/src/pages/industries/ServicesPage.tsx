import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const ServicesPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'services')!;
    return <IndustryLayout config={config} />;
};

export default ServicesPage;
