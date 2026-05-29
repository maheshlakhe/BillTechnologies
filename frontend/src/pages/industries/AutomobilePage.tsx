import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const AutomobilePage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'automobile')!;
    return <IndustryLayout config={config} />;
};

export default AutomobilePage;
