import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const SalonPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'salon')!;
    return <IndustryLayout config={config} />;
};

export default SalonPage;
