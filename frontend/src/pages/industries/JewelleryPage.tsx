import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const JewelleryPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'jewellery')!;
    return <IndustryLayout config={config} />;
};

export default JewelleryPage;
