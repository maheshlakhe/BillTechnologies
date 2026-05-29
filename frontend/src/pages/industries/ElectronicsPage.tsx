import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const ElectronicsPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'electronics')!;
    return <IndustryLayout config={config} />;
};

export default ElectronicsPage;
