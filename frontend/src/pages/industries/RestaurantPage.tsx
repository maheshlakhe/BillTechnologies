import React from 'react';
import IndustryLayout from './IndustryLayout';
import { INDUSTRIES } from '../../constants/industries';

const RestaurantPage: React.FC = () => {
    const config = INDUSTRIES.find(i => i.slug === 'restaurant')!;
    return <IndustryLayout config={config} />;
};

export default RestaurantPage;
