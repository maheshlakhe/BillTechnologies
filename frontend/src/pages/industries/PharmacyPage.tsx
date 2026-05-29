import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const PharmacyPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'pharmacy')!;
    return <IndustryLayout config={config} />;
};

export default PharmacyPage;
