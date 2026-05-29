import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const HealthcarePage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'healthcare')!;
    return <IndustryLayout config={config} />;
};

export default HealthcarePage;
