import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const HardwarePage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'hardware')!;
    return <IndustryLayout config={config} />;
};

export default HardwarePage;
