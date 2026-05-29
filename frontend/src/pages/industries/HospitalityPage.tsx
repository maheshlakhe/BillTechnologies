import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const HospitalityPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'hospitality')!;
    return <IndustryLayout config={config} />;
};

export default HospitalityPage;
