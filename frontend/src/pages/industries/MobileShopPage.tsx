import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const MobileShopPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'mobile-shop')!;
    return <IndustryLayout config={config} />;
};

export default MobileShopPage;
