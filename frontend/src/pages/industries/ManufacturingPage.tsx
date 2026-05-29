import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const ManufacturingPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'manufacturing')!;
    return <IndustryLayout config={config} />;
};

export default ManufacturingPage;
