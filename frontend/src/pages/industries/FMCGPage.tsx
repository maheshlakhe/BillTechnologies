import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const FMCGPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'fmcg')!;
    return <IndustryLayout config={config} />;
};

export default FMCGPage;
