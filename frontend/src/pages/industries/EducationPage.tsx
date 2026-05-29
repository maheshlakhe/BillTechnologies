import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const EducationPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'education')!;
    return <IndustryLayout config={config} />;
};

export default EducationPage;
