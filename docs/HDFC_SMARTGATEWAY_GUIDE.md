# HDFC Smartgateway Integration Guide (v2.0)

This guide provides the complete documentation for integrating HDFC Smartgateway (powered by Juspay) into the BillSoft SaaS platform. It covers both the **SDK (Hypercheckout)** and **Hosted Page (Redirect)** approaches with automatic failover.

---

## 1. Environment Configuration

### 1.1 Backend (.env)
Ensure your backend `.env` file contains the following. For Sandbox, use the specific values noted below.

```env
# HDFC Smartgateway Config
HDFC_MERCHANT_ID=SG4887
HDFC_API_KEY=233A2AF46DB453B944CBA1AB49F922
HDFC_BASE_URL=https://smartgateway.hdfcuat.bank.in # Sandbox URL

# IMPORTANT: For Sandbox, CLIENT_ID MUST be 'hdfcmaster'
HDFC_CLIENT_ID=hdfcmaster 

# Frontend redirect for payment verification
HDFC_RETURN_URL=http://localhost:3000/payment-response
```

### 1.2 Frontend (.env)
Standard React environment variables.
```env
REACT_APP_API_URL=http://localhost:5001/api
```

---

## 2. Backend Implementation (Node.js)

### 2.1 Session Creation Route
The backend must create a session and return both the `sdk_payload` (for SDK) and `payment_links` (for redirect fallback).

```typescript
// backend/src/routes/payments.ts
router.post('/create-subscription-session', authenticateToken, async (req, res) => {
    const session = await createPaymentSession(orderId, amount, userId, userEmail);
    res.json({
        success: true,
        sdk_payload: session.sdk_payload,
        payment_links: session.payment_links, // CRITICAL for fallback
        order_id: orderId
    });
});
```

### 2.2 Payment Service (`paymentService.ts`)
Uses the `HDFC_BASE_URL` and `HDFC_API_KEY` to talk to Smartgateway.
- **POST /session**: Initiates the transaction.
- **GET /orders/{orderId}**: Verifies the status.

---

## 3. Frontend Implementation (React)

### 3.1 Authentication
The platform uses `authToken` in `localStorage`. Ensure the frontend sends this in the `Authorization` header:
```typescript
const token = localStorage.getItem('authToken');
const response = await axios.post(`${API_URL}/payments/create-subscription-session`, { planId }, {
    headers: { Authorization: `Bearer ${token}` }
});
```

### 3.2 Robust Payment Utility (`paymentUtils.ts`)
This utility handles the complexity of loading the Juspay SDK and falling back to a redirect if the SDK fails (e.g., DNS error `ERR_NAME_NOT_RESOLVED`).

```typescript
// frontend/src/utils/paymentUtils.ts
export const initiatePayment = async (sdkPayload, orderId, metadata, paymentLinks) => {
    try {
        await loadJuspaySDK(); // Tries multiple CDNs
        const juspay = window.Juspay.Setup({
            paymentPageClientId: "hdfcmaster",
            onSuccess: (data) => { /* Verify and Redirect */ },
            onError: (data) => { /* Handle Failure */ }
        });
        juspay.open(sdkPayload);
    } catch (err) {
        // FALLBACK: Redirect to hosted page if SDK fails
        if (paymentLinks?.web) {
            window.location.href = paymentLinks.web;
        }
    }
};
```

---

## 4. Payment Verification Page (`PaymentResponse.tsx`)

Once the user returns from either the SDK or the Hosted Page:
1.  Extract `order_id` from URL.
2.  Call Backend `GET /api/payments/verify/:orderId`.
3.  The backend checks for `CHARGED` status and updates the database (`planType`, `planExpiresAt`).

---

## 5. Troubleshooting Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| **401 Unauthorized** | Frontend using wrong token key or missing header. | Ensure `localStorage.getItem('authToken')` is used. |
| **SDK Not Loaded** | DNS failure for `juspay.in` domain. | The implemented fallback will automatically redirect to the Hosted Page. |
| **Invalid Client ID** | Using custom Client ID in Sandbox. | Use `hdfcmaster` for all Sandbox tests. |
| **Amount Mismatch** | `amount` sent as integer. | HDFC requires amount with one decimal place (e.g., `299.0`). |

---

## 6. Implementation Checklist
- [ ] Backend `.env` has `hdfcmaster`.
- [ ] Backend route returns `payment_links`.
- [ ] `paymentUtils.ts` has the `async` loader and `paymentLinks` fallback.
- [ ] `Payment.tsx` passes `payment_links` to `initiatePayment`.
- [ ] `index.html` includes `<script src="https://sdk.juspay.in/pay/v3/checkout.js"></script>`.
