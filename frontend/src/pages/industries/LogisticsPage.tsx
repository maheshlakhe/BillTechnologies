import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const LogisticsPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'logistics')!;
    return <IndustryLayout config={config} />;
};

export default LogisticsPage;
