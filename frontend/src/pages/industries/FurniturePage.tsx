import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const FurniturePage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'furniture')!;
    return <IndustryLayout config={config} />;
};

export default FurniturePage;
