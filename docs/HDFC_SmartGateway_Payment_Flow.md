# HDFC Smart Gateway Payment Flow
## End-to-End Implementation & Testing

> **Platform:** BillSoft SaaS  
> **Gateway Provider:** HDFC SmartGateway (powered by Juspay / HyperCheckout)  
> **Document Version:** 2.0  
> **Date:** 15 April 2026  
> **Status:** UAT / Sandbox Testing (`SG4887`)  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Environment Configuration](#3-environment-configuration)
4. [API Contracts](#4-api-contracts)
5. [Backend Implementation](#5-backend-implementation)
6. [Frontend Implementation](#6-frontend-implementation)
7. [Payment Callback Handling](#7-payment-callback-handling)
8. [Database Schema](#8-database-schema)
9. [End-to-End Payment Flow (Sequence)](#9-end-to-end-payment-flow-sequence)
10. [Error Handling & Resilience](#10-error-handling--resilience)
11. [Testing Guide](#11-testing-guide)
12. [Security Considerations](#12-security-considerations)
13. [Production Deployment Checklist](#13-production-deployment-checklist)
14. [File Inventory](#14-file-inventory)
15. [Appendix: cURL Examples](#15-appendix-curl-examples)

---

## 1. Executive Summary

BillSoft integrates HDFC SmartGateway (Juspay) for **subscription plan payments**. The integration supports two checkout modes with automatic failover:

| Mode | Description | When Used |
|------|-------------|-----------|
| **SDK (HyperCheckout)** | Embedded overlay inside the app | Primary — when Juspay JS SDK loads successfully |
| **Hosted Page (Redirect)** | Full-page redirect to HDFC's payment page | Fallback — when SDK fails (DNS/network errors) |

**Key Capabilities:**
- ✅ Session creation via HDFC Session API
- ✅ Payment verification via HDFC Order API
- ✅ Automatic SDK → Hosted Page fallback
- ✅ Server-side POST/GET callback handler with frontend redirect
- ✅ Plan activation after successful payment
- ✅ Refund initiation support

---

## 2. Architecture Overview

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Material UI)"]
        PRICING["Pricing Page<br/>/pricing"]
        PAYMENT["Payment Page<br/>/payment"]
        RESPONSE["PaymentResponse<br/>/payment-response"]
        UTILS["paymentUtils.ts<br/>(SDK Loader + Fallback)"]
    end

    subgraph Backend["Backend (Node.js + Express + Prisma)"]
        ROUTES["payments.ts<br/>(REST Routes)"]
        SERVICE["paymentService.ts<br/>(HDFC API Client)"]
        CALLBACK["handle-response<br/>(POST/GET Callback)"]
        DB["SQLite<br/>(Prisma ORM)"]
    end

    subgraph HDFC["HDFC SmartGateway (Juspay)"]
        SESSION_API["Session API<br/>POST /session"]
        ORDER_API["Order API<br/>GET /orders/:id"]
        REFUND_API["Refund API<br/>POST /orders/:id/refunds"]
        CHECKOUT["Juspay Checkout<br/>(SDK / Hosted Page)"]
    end

    PRICING --> |Select Plan| UTILS
    PAYMENT --> |Subscribe| UTILS
    UTILS --> |1. Create Session| ROUTES
    ROUTES --> |2. Call HDFC| SERVICE
    SERVICE --> |3. POST /session| SESSION_API
    SESSION_API --> |4. sdk_payload + payment_links| SERVICE
    SERVICE --> |5. Return| ROUTES
    ROUTES --> |6. Response| UTILS
    UTILS --> |7a. SDK Mode| CHECKOUT
    UTILS -.-> |7b. Fallback Redirect| CHECKOUT
    CHECKOUT --> |8. Payment Complete| CALLBACK
    CALLBACK --> |9. Redirect| RESPONSE
    RESPONSE --> |10. Verify| ROUTES
    ROUTES --> |11. Check Status| ORDER_API
    ROUTES --> |12. Update Plan| DB
```

---

## 3. Environment Configuration

### 3.1 Backend Environment Variables (`.env`)

```env
# ──────────────────────────────────────────────
# HDFC SmartGateway Config (UAT/Sandbox)
# ──────────────────────────────────────────────
HDFC_MERCHANT_ID=SG4887
HDFC_CLIENT_ID=hdfcmaster
HDFC_API_KEY=233A2AF46DB453B944CBA1AB49F922
HDFC_BASE_URL=https://smartgateway.hdfcuat.bank.in
HDFC_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
HDFC_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
HDFC_ENV=sandbox
HDFC_RETURN_URL=http://<backend-host>:5001/api/payments/handle-response
```

> [!IMPORTANT]
> **Critical Configuration Notes:**
> - `HDFC_CLIENT_ID` **MUST** be `hdfcmaster` in Sandbox. Using your actual Client ID will result in an `Invalid Client ID` error.
> - `HDFC_API_KEY` is the **raw key**. The service layer Base64-encodes it at runtime as `base64(API_KEY:)` (note the trailing colon).
> - `HDFC_RETURN_URL` points to the **backend** callback handler, NOT directly to the frontend. The backend then redirects to the frontend.

### 3.2 Frontend Environment Variables (`.env`)

```env
REACT_APP_API_URL=http://<backend-host>:5001/api
```

### 3.3 Authentication Token

The platform stores JWT tokens in `localStorage` under the key `authToken`. All authenticated API calls include:

```
Authorization: Bearer <JWT token from localStorage.getItem('authToken')>
```

---

## 4. API Contracts

### 4.1 Create Subscription Session

```
POST /api/payments/create-subscription-session
```

**Authentication:** Required (JWT Bearer Token)

**Request Body:**
```json
{
    "plan": "STARTER" | "GROWTH" | "PRO"
}
```

> [!NOTE]
> `ENTERPRISE` plan returns a 400 error — Enterprise is contact-sales only. `FREE` plan does not trigger any payment flow.

**Success Response (200):**
```json
{
    "success": true,
    "sdk_payload": {
        "requestId": "...",
        "service": "in.juspay.hypercheckout",
        "payload": {
            "clientId": "hdfcmaster",
            "amount": "999.0",
            "merchantId": "SG4887",
            "orderDetails": { "..." }
        }
    },
    "payment_links": {
        "web": "https://smartgateway.hdfcuat.bank.in/pay/..."
    },
    "order_id": "SUB-GROWTH-clxxxx-1713168000000"
}
```

**Error Response (400):**
```json
{ "message": "Invalid plan. Valid options: STARTER, GROWTH, PRO" }
```

---

### 4.2 Verify Payment

```
GET /api/payments/verify/:orderId
```

**Authentication:** None (public endpoint — called from PaymentResponse page)

**Success Response (200) — Payment Charged:**
```json
{
    "success": true,
    "status": "PAID",
    "type": "SUBSCRIPTION",
    "plan": "GROWTH"
}
```

**Failure Response (200) — Payment Not Charged:**
```json
{
    "success": false,
    "status": "PENDING" | "AUTHENTICATION_FAILED" | "AUTHORIZATION_FAILED"
}
```

---

### 4.3 Payment Callback (Gateway → Backend)

```
POST /api/payments/handle-response        ← Primary (HDFC POSTs form data)
GET  /api/payments/handle-response        ← Fallback (some gateways use GET)
```

**Authentication:** None

**Behavior:** Reads `order_id` and `status` from the request body/query, then issues a **302 redirect** to the frontend:

| Gateway Status | Redirect Target |
|----------------|-----------------|
| `CHARGED` | `{FRONTEND_URL}/payment-response?order_id={orderId}` |
| Any other | `{FRONTEND_URL}/payment-response?order_id={orderId}&status=failed&reason={status}` |

---

### 4.4 Health Check

```
GET /api/payments/test
```

**Response:**
```json
{ "message": "Payments router is active" }
```

---

## 5. Backend Implementation

### 5.1 Payment Service (`paymentService.ts`)

The service layer communicates with HDFC SmartGateway APIs.

#### Authentication Header

```typescript
const getAuthHeader = () => {
    const auth = Buffer.from(`${API_KEY}:`).toString('base64');
    return `Basic ${auth}`;
};
```

> The header format is `Basic base64(API_KEY:)` — the trailing colon after the API key is **required**.

#### Session Creation

```typescript
export const createPaymentSession = async (
    orderId: string, 
    amount: number, 
    customerId: string, 
    customerEmail: string
) => {
    const response = await axios.post(`${HDFC_BASE_URL}/session`, {
        order_id: orderId,
        amount: amount.toFixed(1),        // ← HDFC requires decimal format (e.g. "999.0")
        customer_id: customerId,
        customer_email: customerEmail,
        customer_phone: "0000000000",
        payment_page_client_id: CLIENT_ID, // "hdfcmaster" in sandbox
        action: "paymentPage",
        currency: "INR",
        return_url: process.env.HDFC_RETURN_URL,
        description: `Subscription for ${orderId}`,
        first_name: "Customer",
        last_name: customerId.substring(0, 5)
    }, {
        headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
            'x-merchantid': MERCHANT_ID,
            'x-customerid': customerId
        }
    });
    return response.data;  // Contains: sdk_payload, payment_links
};
```

#### Payment Verification

```typescript
export const verifyPaymentStatus = async (orderId: string) => {
    const response = await axios.get(`${HDFC_BASE_URL}/orders/${orderId}`, {
        headers: {
            'Authorization': getAuthHeader(),
            'version': '2023-06-30',
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-merchantid': MERCHANT_ID
        }
    });
    return response.data;  // Contains: .status ("CHARGED", "PENDING", etc.)
};
```

#### Refund

```typescript
export const refundPayment = async (orderId: string, amount: number) => {
    const response = await axios.post(
        `${HDFC_BASE_URL}/orders/${orderId}/refunds`,
        new URLSearchParams({
            unique_request_id: `REF-${orderId}-${Date.now()}`,
            amount: amount.toFixed(2)
        }).toString(),
        {
            headers: {
                'Authorization': getAuthHeader(),
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-merchantid': MERCHANT_ID
            }
        }
    );
    return response.data;
};
```

---

### 5.2 Payment Routes (`payments.ts`)

#### Plan Configuration

```typescript
const PLAN_PRICES: Record<string, number> = {
    STARTER: 399,
    GROWTH: 999,
    PRO: 2499,
};

const PLAN_DAYS: Record<string, number> = {
    STARTER: 30,   // 1 month
    GROWTH: 30,    // 1 month
    PRO: 365,      // 1 year
};
```

#### Order ID Format

```
SUB-{PLAN}-{userId}-{timestamp}
```

Example: `SUB-GROWTH-clxxxx1234-1713168000000`

#### Verification & Plan Activation Logic

On successful verification (`status === 'CHARGED'`):
1. Parse the `plan` name from the Order ID (`parts[1]`)
2. Extract `userId` from the Order ID (`parts[2..-1]` joined with dashes)
3. Look up plan duration from `PLAN_DAYS`
4. Update the `User` record in the database:
   - Set `planType` to the plan name
   - Set `planExpiresAt` to `NOW() + {plan_days} days`

---

## 6. Frontend Implementation

### 6.1 SDK Loader with Dual-CDN Fallback (`paymentUtils.ts`)

```typescript
const loadJuspaySDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (window.Juspay) { resolve(); return; }

        const script = document.createElement('script');
        script.src = 'https://sdk.juspay.in/pay/v3/checkout.js';  // Primary CDN
        script.onload = () => resolve();
        script.onerror = () => {
            // Fallback CDN
            const fallback = document.createElement('script');
            fallback.src = 'https://cdn.juspay.in/pay/v3/checkout.js';
            fallback.onload = () => resolve();
            fallback.onerror = () => reject(new Error('SDK could not be loaded'));
            document.head.appendChild(fallback);
        };
        document.head.appendChild(script);
    });
};
```

### 6.2 Payment Initiation with 3-Tier Fallback

```typescript
export const initiatePayment = async (
    sdkPayload: any,
    orderId: string,
    metadata: { billId?: string, type: 'BILL' | 'SUBSCRIPTION' },
    paymentLinks?: any
) => {
    try {
        // TIER 1: Try loading SDK dynamically
        try {
            await loadJuspaySDK();
        } catch (sdkError) {
            // TIER 2: SDK failed → redirect to Hosted Page
            if (paymentLinks?.web) {
                window.location.href = paymentLinks.web;
                return;
            }
            throw sdkError;
        }

        // TIER 3: SDK script loaded but Juspay object not available
        if (!window.Juspay) {
            if (paymentLinks?.web) {
                window.location.href = paymentLinks.web;
                return;
            }
            throw new Error("Juspay SDK not available");
        }

        // Initialize SDK checkout
        const juspay = window.Juspay.Setup({
            paymentPageClientId: "hdfcmaster",
            onSuccess: (data) => {
                // Verify on backend, then redirect
                axios.get(`${API_URL}/payments/verify/${orderId}`).then(() => {
                    window.location.href = `/payment-response?order_id=${orderId}`;
                });
            },
            onError: (data) => {
                window.location.href = `/payment-response?order_id=${orderId}&status=failed`;
            }
        });
        juspay.open(sdkPayload);

    } catch (error) {
        alert("Payment system is currently unavailable.");
    }
};
```

> [!TIP]
> **Fallback Hierarchy:**
> 1. Primary CDN: `sdk.juspay.in/pay/v3/checkout.js`
> 2. Secondary CDN: `cdn.juspay.in/pay/v3/checkout.js`
> 3. Last Resort: Direct redirect to `payment_links.web` (HDFC Hosted Page)

### 6.3 Payment Page UI (`Payment.tsx`)

**Route:** `/payment`

| Plan | Price | Billing | API ID |
|------|-------|---------|--------|
| Free | ₹0 | Forever | `FREE` |
| Starter | ₹399 | Monthly | `STARTER` |
| Growth ⭐ | ₹999 | Monthly | `GROWTH` |
| Pro | ₹2,499 | Monthly | `PRO` |
| Enterprise | Custom | Contact Sales | `ENTERPRISE` |

**Behavior:**
- Only shows plans at or above the user's current level
- Unauthenticated users → redirected to `/login`
- Enterprise → opens `mailto:` link
- Free → navigates to `/dashboard`
- Other plans → initiates HDFC payment flow

### 6.4 Payment Response Page (`PaymentResponse.tsx`)

**Route:** `/payment-response?order_id=...&status=...`

| State | Trigger | UI |
|-------|---------|-----|
| **Loading** | Initial page load | Spinner + "Verifying Payment..." |
| **Success** | Backend returns `{ success: true, status: "PAID" }` | ✅ Green checkmark + confetti animation + Order ID + "Go to Dashboard" |
| **Failure** | Backend returns failure OR URL has `status=failed` | ❌ Red icon + shake animation + error message + "Try Again" + "Contact Support" |

**Verification Flow:**
1. Wait 1.5s (UX trust delay)
2. If URL has `status=failed` → show failure immediately
3. If no `order_id` → show failure
4. Otherwise → `GET /api/payments/verify/{order_id}` → show result

---

## 7. Payment Callback Handling

The `return_url` sent to HDFC points to the **backend**, not the frontend:

```
return_url = http://<backend>:5001/api/payments/handle-response
```

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant HDFC as HDFC SmartGateway
    participant Backend
    participant Frontend

    User->>HDFC: Completes payment
    HDFC->>Backend: POST /api/payments/handle-response<br/>{order_id, status}
    
    alt status === "CHARGED"
        Backend->>Frontend: 302 Redirect to<br/>/payment-response?order_id=xxx
    else status !== "CHARGED"
        Backend->>Frontend: 302 Redirect to<br/>/payment-response?order_id=xxx&status=failed&reason=...
    end
    
    Frontend->>Backend: GET /api/payments/verify/{order_id}
    Backend->>HDFC: GET /orders/{order_id}
    HDFC-->>Backend: {status: "CHARGED"}
    Backend->>Backend: Update User plan in DB
    Backend-->>Frontend: {success: true, status: "PAID"}
    Frontend->>User: Show success page
```

> [!IMPORTANT]
> Both **POST** and **GET** callback handlers are implemented. HDFC primarily uses POST, but the GET handler provides compatibility with other gateway redirect styles.

---

## 8. Database Schema

### Relevant Prisma Models

```prisma
enum PlanType {
  FREE
  STARTER
  GROWTH
  PRO
  ENTERPRISE
}

enum PaymentStatus {
  PAID
  PARTIAL
  PENDING
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  planType      PlanType  @default(FREE)
  planExpiresAt DateTime? @map("plan_expires_at")
  // ... other fields
}

model FeatureFlag {
  id            String    @id @default(cuid())
  name          String    @unique
  isPaidFeature Boolean   @default(false)
  requiredPlan  PlanType?
  // ... other fields
}
```

### Plan Activation Update Query

```sql
UPDATE users 
SET planType = 'GROWTH', 
    plan_expires_at = datetime('now', '+30 days')
WHERE id = 'clxxxx1234';
```

---

## 9. End-to-End Payment Flow (Sequence)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant HDFC as HDFC SmartGateway
    participant DB as SQLite Database

    U->>FE: Clicks "Subscribe Now" on /payment or /pricing
    FE->>BE: POST /api/payments/create-subscription-session<br/>{plan: "GROWTH"}<br/>Authorization: Bearer JWT
    BE->>BE: Validate JWT → extract userId, email
    BE->>BE: Determine amount (₹999), generate orderId
    Note over BE: orderId = "SUB-GROWTH-clxxxx-171316..."

    BE->>HDFC: POST /session<br/>{order_id, amount: "999.0", customer_id, ...}<br/>Authorization: Basic base64(API_KEY:)
    HDFC-->>BE: {sdk_payload, payment_links}
    BE-->>FE: {sdk_payload, payment_links, order_id}

    FE->>FE: loadJuspaySDK() — dynamic script injection
    
    rect rgb(240, 248, 255)
        Note over FE,HDFC: SDK Mode (Primary)
        alt SDK loads successfully
            FE->>HDFC: window.Juspay.Setup() → juspay.open(sdk_payload)
            U->>HDFC: Enters card/UPI details in checkout overlay
            HDFC-->>FE: onSuccess callback fired
            FE->>BE: GET /api/payments/verify/{order_id}
        else SDK fails (DNS/network error)
            Note over FE: Fallback: redirect to payment_links.web
            FE->>HDFC: window.location.href = payment_links.web
            U->>HDFC: Completes payment on HDFC Hosted Page
            HDFC->>BE: POST /api/payments/handle-response
            BE->>FE: 302 Redirect to /payment-response?order_id=...
            FE->>BE: GET /api/payments/verify/{order_id}
        end
    end

    BE->>HDFC: GET /orders/{order_id}
    HDFC-->>BE: {status: "CHARGED", amount: "999.0"}
    BE->>DB: UPDATE User SET planType="GROWTH",<br/>planExpiresAt=NOW()+30 days
    BE-->>FE: {success: true, status: "PAID", plan: "GROWTH"}
    FE->>U: ✅ "Payment Successful!" + confetti 🎉
```

---

## 10. Error Handling & Resilience

### 10.1 Common Error Scenarios

| # | Error | Root Cause | Handling |
|---|-------|-----------|----------|
| 1 | `ERR_NAME_NOT_RESOLVED` for `juspay.in` | DNS blocked for Juspay CDN on user's network | Auto-fallback to secondary CDN, then to Hosted Page redirect |
| 2 | `401 Unauthorized` on session creation | Frontend sending wrong/missing JWT token | Frontend uses `localStorage.getItem('authToken')` with `Bearer` prefix |
| 3 | `Invalid Client ID` from HDFC | Using production Client ID in sandbox | Sandbox **must** use `hdfcmaster` |
| 4 | Amount format error | Amount sent as integer (e.g. `999`) | Service calls `.toFixed(1)` to format as `"999.0"` |
| 5 | `AUTHENTICATION_FAILED` after payment | User abandoned 3DS/OTP verification | Show failure page with "Try Again" option |
| 6 | `Cannot POST /payment-response` | Gateway POSTing to frontend (React can't handle POST) | `return_url` now points to backend `/api/payments/handle-response` which does a 302 redirect |
| 7 | Order verification timeout | HDFC API slow to respond | Frontend shows loading state with 1.5s delay; backend logs error |

### 10.2 HDFC Payment Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| `CHARGED` | Payment successful | Activate plan, redirect to success page |
| `PENDING` | Payment processing | Show "check back later" message |
| `PENDING_VBV` | Waiting for 3DS verification | User needs to complete verification |
| `AUTHENTICATION_FAILED` | 3DS/OTP failed | Show failure, allow retry |
| `AUTHORIZATION_FAILED` | Bank declined | Show failure, suggest different payment method |
| `JUSPAY_DECLINED` | Gateway declined | Show failure, contact support |

---

## 11. Testing Guide

### 11.1 Sandbox Test Cards

| Card Network | Card Number | Expiry | CVV | Expected Result |
|-------------|-------------|--------|-----|-----------------|
| **Visa** | `4111 1111 1111 1111` | Any future date | `123` | Success (`CHARGED`) |
| **Mastercard** | `5500 0000 0000 0004` | Any future date | `123` | Success (`CHARGED`) |
| **RuPay** | `6061 1111 1111 1111` | Any future date | `123` | Success (`CHARGED`) |
| **Net Banking** | Select any bank | N/A | N/A | Success (`CHARGED`) |

> [!NOTE]
> In the sandbox environment, all test cards will result in a `CHARGED` status. OTP challenges may or may not appear depending on the card type.

### 11.2 Test Scenarios Checklist

| # | Scenario | Steps | Expected Outcome |
|---|----------|-------|-----------------|
| 1 | **Happy Path — SDK** | Login → /payment → Select Growth → Pay with test card | ✅ Success page with confetti, plan updated to GROWTH |
| 2 | **Happy Path — Hosted Page** | Block `juspay.in` in hosts file → Repeat #1 | ✅ Redirected to HDFC hosted page, then success |
| 3 | **Unauthenticated User** | Navigate to /payment without login → Click plan | Redirected to /login |
| 4 | **Enterprise Plan** | Click Enterprise → "Contact Sales" | Opens mailto: link |
| 5 | **Payment Failure** | Start payment → Close checkout without completing | ❌ Failure page with "Try Again" |
| 6 | **Verify endpoint** | Call `GET /api/payments/verify/INVALID-ORDER` | Returns `{ success: false }` |
| 7 | **Backend callback POST** | HDFC POSTs to `/api/payments/handle-response` | 302 redirect to frontend |
| 8 | **Plan hierarchy filter** | Login as GROWTH user → Navigate to /payment | Only GROWTH, PRO, ENTERPRISE shown |

### 11.3 Sandbox API Endpoints

| Purpose | Method | URL |
|---------|--------|-----|
| Create Session | `POST` | `https://smartgateway.hdfcuat.bank.in/session` |
| Get Order Status | `GET` | `https://smartgateway.hdfcuat.bank.in/orders/{order_id}` |
| Initiate Refund | `POST` | `https://smartgateway.hdfcuat.bank.in/orders/{order_id}/refunds` |

---

## 12. Security Considerations

| Concern | Implementation |
|---------|---------------|
| **API Key Protection** | API key stored in backend `.env` only — never exposed to frontend |
| **JWT Authentication** | Session creation endpoint requires valid JWT token |
| **Server-side Verification** | Payment status always verified server-side via HDFC Order API — never trusting client-side callbacks alone |
| **Callback Validation** | Backend callback handler logs all incoming data and redirects with appropriate status |
| **HTTPS** | All HDFC API calls made over HTTPS |
| **Order ID Format** | Embeds `userId` for traceability and plan name for verification |
| **Amount Validation** | Amount determined server-side from plan configuration — never from client request |

---

## 13. Production Deployment Checklist

> [!CAUTION]
> **All items below MUST be completed before going live.** Failure to update any of these will result in payment failures or security issues in production.

| # | Item | Sandbox Value | Production Value | File |
|---|------|---------------|------------------|------|
| 1 | `HDFC_MERCHANT_ID` | `SG4887` | _Your production Merchant ID_ | `.env` |
| 2 | `HDFC_CLIENT_ID` | `hdfcmaster` | _Your production Client ID_ | `.env` |
| 3 | `HDFC_API_KEY` | `233A2AF46DB4...` | _Your production API Key_ | `.env` |
| 4 | `HDFC_BASE_URL` | `https://smartgateway.hdfcuat.bank.in` | `https://smartgateway.hdfc.bank.in` | `.env` |
| 5 | `HDFC_RETURN_URL` | `http://localhost:5001/api/payments/handle-response` | `https://api.yourdomain.com/api/payments/handle-response` | `.env` |
| 6 | `HDFC_ENV` | `sandbox` | `production` | `.env` |
| 7 | `paymentPageClientId` | `"hdfcmaster"` | _Your production Client ID_ | `paymentUtils.ts` |
| 8 | `FRONTEND_URL` | `http://localhost:3000` | `https://yourdomain.com` | `.env` |
| 9 | RSA Key Pair | Placeholder | _Production RSA Keys from HDFC_ | `.env` |
| 10 | SSL Certificate | N/A | Required for all production URLs | Server |

---

## 14. File Inventory

| Layer | File | Purpose |
|-------|------|---------|
| **Config** | `backend/.env` | HDFC credentials, URLs, keys |
| **Backend Service** | `backend/src/services/paymentService.ts` | HDFC API communication (session, verify, refund) |
| **Backend Routes** | `backend/src/routes/payments.ts` | REST endpoints + callback handler |
| **Backend Entry** | `backend/src/index.ts` | Mounts `/api/payments` router |
| **Frontend Utility** | `frontend/src/utils/paymentUtils.ts` | SDK loader + checkout initiator + fallback |
| **Frontend Page** | `frontend/src/pages/Payment.tsx` | Subscription plan selection + checkout UI |
| **Frontend Page** | `frontend/src/pages/PaymentResponse.tsx` | Post-payment verification & status display |
| **Frontend Page** | `frontend/src/pages/Pricing.tsx` | Public pricing page with integrated checkout |
| **Frontend Page** | `frontend/src/pages/SubscriptionManagement.tsx` | Admin plan overview & upgrade navigation |
| **Frontend Component** | `frontend/src/components/bills/PaymentButton.tsx` | Inline bill payment button |
| **Frontend Routing** | `frontend/src/App.tsx` | Route definitions for all payment pages |
| **Database** | `backend/prisma/schema.prisma` | `PlanType` enum, `User.planType`, `User.planExpiresAt` |

---

## 15. Appendix: cURL Examples

### A. Create a Payment Session

```bash
curl -X POST https://smartgateway.hdfcuat.bank.in/session \
  -H "Authorization: Basic $(echo -n '233A2AF46DB453B944CBA1AB49F922:' | base64)" \
  -H "Content-Type: application/json" \
  -H "x-merchantid: SG4887" \
  -H "x-customerid: test-user-001" \
  -d '{
    "order_id": "SUB-GROWTH-test001-1713168000000",
    "amount": "999.0",
    "customer_id": "test-user-001",
    "customer_email": "test@example.com",
    "customer_phone": "9999999999",
    "payment_page_client_id": "hdfcmaster",
    "action": "paymentPage",
    "currency": "INR",
    "return_url": "http://localhost:5001/api/payments/handle-response",
    "description": "Subscription for Growth Plan",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### B. Verify Order Status

```bash
curl -X GET https://smartgateway.hdfcuat.bank.in/orders/SUB-GROWTH-test001-1713168000000 \
  -H "Authorization: Basic $(echo -n '233A2AF46DB453B944CBA1AB49F922:' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "version: 2023-06-30" \
  -H "x-merchantid: SG4887"
```

### C. Initiate Refund

```bash
curl -X POST https://smartgateway.hdfcuat.bank.in/orders/SUB-GROWTH-test001-1713168000000/refunds \
  -H "Authorization: Basic $(echo -n '233A2AF46DB453B944CBA1AB49F922:' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "x-merchantid: SG4887" \
  -d "unique_request_id=REF-SUB-GROWTH-test001-1713168000000-$(date +%s)&amount=999.00"
```

---

> **Document Prepared By:** BillSoft Engineering Team  
> **For:** HDFC Payment Integration Team  
> **Contact:** agbitsolutions247@gmail.com
