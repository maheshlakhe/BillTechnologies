import React, { useEffect } from 'react';

const Pricing: React.FC = () => {
    useEffect(() => {
        // Instant, seamless scroll-safe redirect to the landing page's official pricing section
        window.location.replace('/#pricing');
    }, []);

    return null;
};

export default Pricing;
