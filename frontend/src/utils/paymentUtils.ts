import { API_URL } from '../config/api';

/**
 * Dynamically loads the Juspay/HDFC SDK from multiple sources with fallback.
 */
const SDK_URLS = [
    `${API_URL}/payments/sdk-proxy`, // New: Backend proxy to bypass network blocks
    'https://smartgatewayuat.hdfcbank.in/checkout.js',
    'https://payments.juspay.in/payment-page/assets/juspay-web-sdk.js',
    'https://sdk.juspay.in/pay/v3/checkout.js',
    'https://cdn.juspay.in/pay/v3/checkout.js',
];

const tryLoadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
            reject(new Error(`Failed to load: ${src}`));
        };
        document.head.appendChild(script);
    });
};

const loadJuspaySDK = async (): Promise<void> => {
    if (window.Juspay) return;

    for (const url of SDK_URLS) {
        try {
            await tryLoadScript(url);
            if (window.Juspay) {
                console.log(`[PaymentUtils] SDK loaded from: ${url}`);
                return;
            }
        } catch {
            console.warn(`[PaymentUtils] SDK source failed: ${url}`);
        }
    }
    throw new Error('Juspay SDK could not be loaded from any source.');
};

export const initiatePayment = async (
    sdkPayload: any,
    orderId: string,
    metadata: { billId?: string; type: 'BILL' | 'SUBSCRIPTION' },
    paymentLinks?: any
) => {
    try {
        try {
            await loadJuspaySDK();
        } catch (sdkError) {
            console.warn('[PaymentUtils] SDK load failed. Using hosted page redirect.');
            if (paymentLinks?.web) {
                window.location.href = paymentLinks.web;
                return;
            }
            throw sdkError;
        }

        if (!window.Juspay) {
            if (paymentLinks?.web) {
                window.location.href = paymentLinks.web;
                return;
            }
            throw new Error('Juspay object not found.');
        }

        const juspay = window.Juspay.Setup({
            paymentPageClientId: 'hdfcmaster',
            onSuccess: (data: any) => {
                console.log('[HDFC SDK] Success:', data);
                window.location.href = `/payment-response?order_id=${orderId}&status=success`;
            },
            onError: (data: any) => {
                console.error('[HDFC SDK] Error:', data);
                window.location.href = `/payment-response?order_id=${orderId}&status=failed`;
            },
        });

        juspay.open(sdkPayload);

    } catch (error: any) {
        const errorMsg = error.message || 'Unknown Error';
        console.error('[PaymentUtils] Error:', errorMsg);
        
        if (paymentLinks?.web) {
            console.log('[PaymentUtils] Falling back to hosted page...');
            window.location.href = paymentLinks.web;
        } else {
            alert(`Payment system unavailable.\nReason: ${errorMsg}\n\n(Fallback URL also missing from backend)`);
        }
    }
};
