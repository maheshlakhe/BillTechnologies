import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const GymPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'gym')!;
    return <IndustryLayout config={config} />;
};

export default GymPage;
