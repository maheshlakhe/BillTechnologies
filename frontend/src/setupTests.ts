import { TextEncoder, TextDecoder } from 'util';

import '@testing-library/jest-dom';
Object.assign(global, { TextDecoder, TextEncoder });

// Mock IntersectionObserver for LandingPage and other components
class IntersectionObserverMock {
    root = null;
    rootMargin = "";
    thresholds = [];
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() { return []; }
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock
});

Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock
});
