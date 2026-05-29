import axios from 'axios';

const HDFC_BASE_URL = process.env.HDFC_BASE_URL || 'https://smartgateway.hdfcuat.bank.in';
const MERCHANT_ID = process.env.HDFC_MERCHANT_ID;
const API_KEY = process.env.HDFC_API_KEY;
const CLIENT_ID = process.env.HDFC_CLIENT_ID || 'hdfcmaster';

const getAuthHeader = () => {
    const auth = Buffer.from(`${API_KEY}:`).toString('base64');
    return `Basic ${auth}`;
};

export const createPaymentSession = async (
    orderId: string,
    amount: number,
    customerId: string,
    customerEmail: string
) => {
    try {
            const isLocalIp = (url: string) => url.includes('192.168.') || url.includes('localhost') || url.includes('127.0.0.1');
            const returnUrlContent = (process.env.NODE_ENV === 'production' && process.env.HDFC_RETURN_URL && !isLocalIp(process.env.HDFC_RETURN_URL))
                ? process.env.HDFC_RETURN_URL
                : (process.env.NODE_ENV === 'production' 
                    ? 'https://billsoft.agbtechnologies.com/api/payments/handle-response'
                    : (process.env.HDFC_RETURN_URL || `${process.env.BASE_URL || 'http://localhost:3001'}/api/payments/handle-response`));

            const payload = {
                order_id: orderId,
                amount: amount.toFixed(2),
                customer_id: customerId,
                customer_email: customerEmail,
                customer_phone: '9876543210',
                payment_page_client_id: CLIENT_ID,
                action: 'paymentPage',
                currency: 'INR',
                return_url: returnUrlContent,
            description: `Payment for Order ${orderId}`,
            first_name: 'BillSoft',
            last_name: 'User',
        };

        console.log('[HDFC Service] Payload Sending:', JSON.stringify(payload, null, 2));

        const response = await axios.post(`${HDFC_BASE_URL}/session`, payload, {
            headers: {
                'Authorization': getAuthHeader(),
                'Content-Type': 'application/json',
                'x-merchantid': MERCHANT_ID,
                'x-customerid': customerId,
                'version': '2023-06-30', // Ensure latest API version
            }
        });

        return response.data;
    } catch (error: any) {
        console.error('[HDFC Service] API Error:', error.response?.data || error.message);
        throw new Error('Failed to create payment session');
    }
};

export const verifyPaymentStatus = async (orderId: string) => {
    try {
        const response = await axios.get(`${HDFC_BASE_URL}/orders/${orderId}`, {
            headers: {
                'Authorization': getAuthHeader(),
                'x-merchantid': MERCHANT_ID,
                'version': '2023-06-30',
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('[HDFC Service] Status Error:', error.response?.data || error.message);
        throw new Error('Verification failed');
    }
};
