# HDFC Smartgateway Troubleshooting Guide

Common errors and their resolutions when working with HDFC Smartgateway (Juspay) in the sandbox/UAT environment.

### 1. `ERR_NAME_NOT_RESOLVED` for `juspay.in`
**Cause**: The DNS names for Juspay's CDNs are not resolving in your current network.
**Resolution**:
1. Check if you can open `https://sdk.juspay.in/pay/v3/checkout.js` in a browser tab.
2. If blocked, the implemented **Redirection Fallback** in `paymentUtils.ts` handles this by switching to the HDFC Hosted Payment Page.
3. Ensure no firewall is blocking `smartgateway.hdfcuat.bank.in`.

### 2. `401 Unauthorized` (Session Creation)
**Cause**: The backend is rejecting the request because of an invalid JWT or missing `Authorization` header from the frontend.
**Resolution**:
1. Ensure the frontend uses `localStorage.getItem('authToken')`.
2. Check the `.env` on the backend to ensure `JWT_SECRET` matches the one used for login.

### 3. `Invalid Client ID` Error
**Cause**: You are using your real Merchant Client ID in the Sandbox environment.
**Resolution**:
1. For **Sandbox**, `HDFC_CLIENT_ID` inside the session request **MUST** be `hdfcmaster`.
2. For **Production**, change it back to your specific Client ID.

### 4. `Transaction Status: FAILED` after payment
**Cause**: Verification call failed or payment was rejected by the gateway.
**Resolution**:
1. Check the backend logs for `[HDFC Service] Order Status Error`.
2. Ensure `HDFC_API_KEY` in `.env` is correct. The API Key should be the raw string, and the service will handle the Base64 encoding.

### 5. No Plans Showing on Payment Page
**Cause**: The user is already on the highest plan or the plan list in `Payment.tsx` doesn't match the database types.
**Resolution**:
1. Verify `planType` in the `User` table (Prisma).
2. Ensure `handleSelectPlan` is called with either 'BASIC', 'PREMIUM', or 'ENTERPRISE'.

---

### Sandbox Test Cards
Use these cards to test the flow in the UAT environment:

| Card Network | Card Number | Expiry | CVV |
|--------------|-------------|--------|-----|
| **Visa/Mastercard** | `4111 1111 1111 1111` | Any future date | `123` |
| **RuPay** | `6061 1111 1111 1111` | Any future date | `123` |
| **Net Banking** | Any bank selected | N/A | N/A |
