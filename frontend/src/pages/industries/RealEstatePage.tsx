import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const RealEstatePage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'real-estate')!;
    return <IndustryLayout config={config} />;
};

export default RealEstatePage;
