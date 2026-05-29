import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const TextilePage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'textile')!;
    return <IndustryLayout config={config} />;
};

export default TextilePage;
