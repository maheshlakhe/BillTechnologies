# 💳 HDFC SmartGateway (Juspay) — Complete Payment Integration Snapshot

> **BillSoft SaaS Platform** | Generated: 15 April 2026  
> **Gateway:** HDFC SmartGateway (powered by Juspay)  
> **Environment:** UAT/Sandbox (SG4887)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Environment Configuration](#2-environment-configuration)
3. [Backend — Payment Service](#3-backend--payment-service)
4. [Backend — Payment Routes](#4-backend--payment-routes)
5. [Backend — Router Mounting](#5-backend--router-mounting)
6. [Frontend — Payment Utilities (SDK Loader)](#6-frontend--payment-utilities-sdk-loader)
7. [Frontend — Payment Page (Subscription Checkout)](#7-frontend--payment-page-subscription-checkout)
8. [Frontend — Payment Response Page](#8-frontend--payment-response-page)
9. [Frontend — PaymentButton Component (Bill Payments)](#9-frontend--paymentbutton-component-bill-payments)
10. [Frontend — Pricing Page (Public)](#10-frontend--pricing-page-public)
11. [Frontend — Subscription Management Page](#11-frontend--subscription-management-page)
12. [Database Schema (Prisma)](#12-database-schema-prisma)
13. [Frontend Routing (App.tsx)](#13-frontend-routing-apptsx)
14. [End-to-End Payment Flow](#14-end-to-end-payment-flow)
15. [Key Configuration Notes](#15-key-configuration-notes)

---

## 1. Architecture Overview

```mermaid
graph TB
    subgraph Frontend["Frontend (React + MUI)"]
        PP["Pricing Page<br/>/pricing"]
        PAY["Payment Page<br/>/payment"]
        PR["PaymentResponse<br/>/payment-response"]
        PB["PaymentButton<br/>(Bill-level)"]
        PU["paymentUtils.ts<br/>(SDK Loader)"]
        SM["SubscriptionManagement<br/>/admin/subscription"]
    end
    
    subgraph Backend["Backend (Express + Prisma)"]
        RT["payments.ts<br/>(Routes)"]
        SV["paymentService.ts<br/>(Service Layer)"]
        DB["SQLite DB<br/>(Prisma User model)"]
    end
    
    subgraph HDFC["HDFC SmartGateway (Juspay)"]
        API["Session API<br/>POST /session"]
        ORD["Order API<br/>GET /orders/:id"]
        SDK["Juspay JS SDK<br/>checkout.js"]
    end
    
    PP --> |"Select Plan"| PU
    PAY --> |"Subscribe Now"| PU
    PB --> |"Pay Now"| PU
    SM --> |"Upgrade"| PAY
    
    PU --> |"1. Create Session"| RT
    RT --> |"2. Call HDFC API"| SV
    SV --> |"3. POST /session"| API
    API --> |"4. sdk_payload"| SV
    SV --> |"5. Return payload"| RT
    RT --> |"6. sdk_payload"| PU
    PU --> |"7. Open Checkout"| SDK
    SDK --> |"8. Payment Complete"| PU
    PU --> |"9. Redirect"| PR
    PR --> |"10. Verify"| RT
    RT --> |"11. GET /orders/:id"| ORD
    RT --> |"12. Update Plan"| DB
```

---

## 2. Environment Configuration

📄 **File:** [.env](file:///d:/billsoft/rushbh/billsoft_saas/backend/.env)

```env
# HDFC Smartgateway Config (UAT/Sandbox)
HDFC_MERCHANT_ID=SG4887
HDFC_CLIENT_ID=hdfcmaster
HDFC_API_KEY=233A2AF46DB453B944CBA1AB49F922
HDFC_BASE_URL=https://smartgateway.hdfcuat.bank.in
HDFC_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
HDFC_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
HDFC_ENV=sandbox # or production
HDFC_RETURN_URL=http://localhost:3000/payment-response
```

> [!IMPORTANT]
> - `HDFC_MERCHANT_ID` = **SG4887** (UAT Sandbox)
> - `HDFC_CLIENT_ID` = **hdfcmaster** (used as `payment_page_client_id` in SDK)
> - `HDFC_API_KEY` is used for Basic Auth (Base64 encoded as `API_KEY:`)
> - `HDFC_RETURN_URL` is the frontend page where HDFC redirects after payment

---

## 3. Backend — Payment Service

📄 **File:** [paymentService.ts](file:///d:/billsoft/rushbh/billsoft_saas/backend/src/services/paymentService.ts)

### 3.1 Auth Header Generation
```typescript
const getAuthHeader = () => {
    const auth = Buffer.from(`${API_KEY}:`).toString('base64');
    return `Basic ${auth}`;
};
```
> Format: `Basic base64(API_KEY:)` — note the trailing colon.

### 3.2 `createPaymentSession()`
Creates an order session on HDFC SmartGateway.

```typescript
export const createPaymentSession = async (
    orderId: string, 
    amount: number, 
    customerId: string, 
    customerEmail: string
) => {
    const response = await axios.post(`${HDFC_BASE_URL}/session`, {
        order_id: orderId,
        amount: amount.toFixed(1),
        customer_id: customerId,
        customer_email: customerEmail,
        customer_phone: "0000000000",
        payment_page_client_id: CLIENT_ID,  // "hdfcmaster"
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
    return response.data;  // Contains sdk_payload & payment_links
};
```

### 3.3 `verifyPaymentStatus()`
Checks order status via the HDFC Order API.

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
    return response.data; // Contains .status ("CHARGED", "PENDING", etc.)
};
```

### 3.4 `refundPayment()`
Initiates a refund on a charged order.

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

## 4. Backend — Payment Routes

📄 **File:** [payments.ts](file:///d:/billsoft/rushbh/billsoft_saas/backend/src/routes/payments.ts)

### 4.1 `POST /api/payments/create-subscription-session`
**Protected** (requires JWT via `authenticateToken`).

| Param | Type | Description |
|-------|------|-------------|
| `plan` | `string` | `"BASIC"`, `"PREMIUM"`, or `"ENTERPRISE"` |

**Plan Pricing:**
| Plan | Amount (INR) |
|------|-------------|
| BASIC | ₹299 |
| PREMIUM | ₹2,499 |
| ENTERPRISE | ₹4,999 |

**Order ID Format:** `SUB-{userId}-{timestamp}`

**Response:**
```json
{
    "success": true,
    "sdk_payload": { ... },
    "payment_links": { "web": "https://..." },
    "order_id": "SUB-clu123-1713168000000"
}
```

### 4.2 `GET /api/payments/verify/:orderId`
**Public** (no auth required — called from PaymentResponse).

**Logic:**
1. Calls `verifyPaymentStatus()` on HDFC API
2. If `status === 'CHARGED'` and `orderId.startsWith('SUB-')`:
   - Extracts `userId` from the orderId
   - Determines plan from the `amount` field
   - Updates `User.planType` and `User.planExpiresAt` in DB
   - BASIC = 30 days, PREMIUM/ENTERPRISE = 365 days

### 4.3 `GET /api/payments/test`
Simple health-check for the payments router.

---

## 5. Backend — Router Mounting

📄 **File:** [index.ts](file:///d:/billsoft/rushbh/billsoft_saas/backend/src/index.ts) (Lines 279, 298)

```typescript
import paymentRoutes from './routes/payments';

// Mounted as:
{ path: 'payments', routes: paymentRoutes }

// Which resolves to:
app.use('/api/payments', paymentRoutes);
```

---

## 6. Frontend — Payment Utilities (SDK Loader)

📄 **File:** [paymentUtils.ts](file:///d:/billsoft/rushbh/billsoft_saas/frontend/src/utils/paymentUtils.ts)

### 6.1 Dynamic SDK Loading with Fallback

```typescript
const loadJuspaySDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (window.Juspay) { resolve(); return; }

        const script = document.createElement('script');
        script.src = 'https://sdk.juspay.in/pay/v3/checkout.js';  // Primary
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

### 6.2 `initiatePayment()` Function

```typescript
export const initiatePayment = async (
    sdkPayload: any, 
    orderId: string, 
    metadata: { billId?: string, type: 'BILL' | 'SUBSCRIPTION' }, 
    paymentLinks?: any
) => {
    // 1. Try loading SDK dynamically
    // 2. If SDK fails → redirect to paymentLinks.web (fallback)
    // 3. Setup Juspay with onSuccess/onError callbacks
    // 4. On success → verify via backend → redirect to /payment-response
    // 5. On error → redirect to /payment-response?status=failed
    
    const juspay = window.Juspay.Setup({
        paymentPageClientId: "hdfcmaster",
        onSuccess: (data) => {
            axios.get(`${API_URL}/payments/verify/${orderId}`).then(() => {
                window.location.href = `/payment-response?order_id=${orderId}`;
            });
        },
        onError: (data) => {
            window.location.href = `/payment-response?order_id=${orderId}&status=failed`;
        }
    });
    juspay.open(sdkPayload);
};
```

> [!TIP]
> The SDK has a **dual-source fallback** mechanism:
> 1. Primary: `sdk.juspay.in`
> 2. Fallback: `cdn.juspay.in`
> 3. Last resort: Direct redirect to `payment_links.web` URL

---

## 7. Frontend — Payment Page (Subscription Checkout)

📄 **File:** [Payment.tsx](file:///d:/billsoft/rushbh/billsoft_saas/frontend/src/pages/Payment.tsx)

**Route:** `/payment`

**Features:**
- Displays 3 subscription plans (BASIC ₹299/mo, PREMIUM ₹2,499/yr, ENTERPRISE ₹4,999/yr)
- Filters plans based on the user's current plan level (only shows current + higher)
- Shows loading spinner per plan button during checkout
- If user is not logged in → redirects to `/login`
- Calls `POST /api/payments/create-subscription-session` with JWT auth
- Passes `sdk_payload` + `payment_links` to `initiatePayment()`
- Displays "Secure payment processed via HDFC Smartgateway" trust badge

---

## 8. Frontend — Payment Response Page

📄 **File:** [PaymentResponse.tsx](file:///d:/billsoft/rushbh/billsoft_saas/frontend/src/pages/PaymentResponse.tsx)

**Route:** `/payment-response?order_id=...`

**States:**
| State | UI |
|-------|------|
| `loading` | Spinner + "Verifying Payment" |
| `success` | ✅ Green checkmark + Order ID display + "Back to Home" |
| `failure` | ❌ Red error icon + "Try Again" + "Contact Support" |

**Logic:**
1. Reads `order_id` from URL query params
2. Calls `GET /api/payments/verify/{order_id}`
3. If response `success === true && status === 'PAID'` → show success
4. Otherwise → show failure

---

## 9. Frontend — PaymentButton Component (Bill Payments)

📄 **File:** [PaymentButton.tsx](file:///d:/billsoft/rushbh/billsoft_saas/frontend/src/components/bills/PaymentButton.tsx)

**Purpose:** Inline "Pay Now" button for individual bill payments.

**Props:**
| Prop | Type | Default |
|------|------|---------|
| `bill` | `any` | required |
| `onSuccess` | `() => void` | optional |
| `variant` | `'contained' \| 'outlined'` | `'contained'` |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` |
| `fullWidth` | `boolean` | `false` |

**Flow:**
1. Checks `window.Juspay` is loaded
2. Calls `POST /api/payments/create-session` with `billId`
3. Opens checkout via `initiatePayment()` with `type: 'BILL'`

> [!NOTE]
> Declares `window.Juspay` as a global TypeScript type via `declare global { interface Window { Juspay: any; } }`

---

## 10. Frontend — Pricing Page (Public)

📄 **File:** [Pricing.tsx](file:///d:/billsoft/rushbh/billsoft_saas/frontend/src/pages/Pricing.tsx)

**Route:** `/pricing`

**Plans Displayed:**
| Plan | Price | Period | Highlight |
|------|-------|--------|-----------|
| FREE | ₹0 | Lifetime | — |
| STANDARD | ₹2,499 | Annual | ⭐ MOST POPULAR |
| ENTERPRISE | ₹4,999 | Annual | — |

**Checkout Logic:**
- If user **not logged in** → redirect to `/signup` with `selectedPlan` state
- If plan is **FREE** → redirect to `/dashboard`
- Otherwise → call `POST /api/payments/create-subscription-session` → `initiatePayment()`

---

## 11. Frontend — Subscription Management Page

📄 **File:** [SubscriptionManagement.tsx](file:///d:/billsoft/rushbh/billsoft_saas/frontend/src/pages/SubscriptionManagement.tsx)

**Route:** `/admin/subscription`

**Features:**
- Shows current plan name, status (Active/Expired), billing cycle, next renewal date
- Displays plan price and monthly usage progress bar
- Feature management table with toggles (Invoice Customization, Multi-User, API, Bulk SMS, Analytics)
- "Upgrade to Premium" / "Manage / Renew Plan" button → navigates to `/payment`
- Role-based access control via `useRoleBasedAccess()` hook

---

## 12. Database Schema (Prisma)

📄 **File:** [schema.prisma](file:///d:/billsoft/rushbh/billsoft_saas/backend/prisma/schema.prisma)

### PlanType Enum
```prisma
enum PlanType {
  FREE
  BASIC
  PREMIUM
  ENTERPRISE
}
```

### User Model (Plan Fields)
```prisma
model User {
  // ... other fields ...
  planType         PlanType  @default(FREE)
  planExpiresAt    DateTime? @map("plan_expires_at")
  // ...
}
```

### FeatureFlag Model (Plan Gating)
```prisma
model FeatureFlag {
  // ...
  isPaidFeature  Boolean    @default(false)
  requiredPlan   PlanType?  @map("required_plan")
  // ...
}
```

### PaymentStatus Enum (for Bills)
```prisma
enum PaymentStatus {
  PAID
  PARTIAL
  PENDING
}
```

---

## 13. Frontend Routing (App.tsx)

📄 **File:** [App.tsx](file:///d:/billsoft/rushbh/billsoft_saas/frontend/src/App.tsx)

```typescript
import Pricing from './pages/Pricing';                     // Line 12
import PaymentPage from './pages/Payment';                 // Line 21
import PaymentResponse from './pages/PaymentResponse';     // Line 22
const SubscriptionManagement = lazyWithRetry(              // Line 42
    () => import('./pages/SubscriptionManagement')
);

// Routes:
<Route path="/pricing" element={<Pricing />} />                           // Line 84
<Route path="/payment" element={<PaymentPage />} />                       // Line 94
<Route path="/payment-response" element={<PaymentResponse />} />          // Line 95
<Route path="subscription" element={<SubscriptionManagement />} />        // Line 114 (under /admin)
```

---

## 14. End-to-End Payment Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant HDFC as HDFC SmartGateway
    participant DB as SQLite Database

    U->>FE: Clicks "Subscribe Now" on /payment or /pricing
    FE->>BE: POST /api/payments/create-subscription-session<br/>{plan: "PREMIUM"}<br/>Authorization: Bearer JWT
    BE->>BE: Validate JWT, determine amount (₹2,499)
    BE->>HDFC: POST /session<br/>{order_id, amount, customer_id, ...}<br/>Authorization: Basic base64(API_KEY:)
    HDFC-->>BE: {sdk_payload, payment_links}
    BE-->>FE: {sdk_payload, payment_links, order_id}
    
    FE->>FE: loadJuspaySDK() (dynamic script injection)
    FE->>HDFC: window.Juspay.Setup() → juspay.open(sdk_payload)
    Note over U,HDFC: User completes payment on<br/>HDFC checkout overlay/page
    
    HDFC-->>FE: onSuccess callback
    FE->>BE: GET /api/payments/verify/{order_id}
    BE->>HDFC: GET /orders/{order_id}
    HDFC-->>BE: {status: "CHARGED", amount: "2499.0"}
    BE->>DB: UPDATE User SET planType="PREMIUM",<br/>planExpiresAt=NOW()+365 days
    BE-->>FE: {success: true, status: "PAID", plan: "PREMIUM"}
    FE->>U: Redirect to /payment-response?order_id=...<br/>✅ "Payment Successful!"
```

---

## 15. Key Configuration Notes

> [!WARNING]
> ### Production Checklist
> Before going live, the following must be updated:
> 1. **`HDFC_MERCHANT_ID`** — Replace `SG4887` with your production Merchant ID
> 2. **`HDFC_CLIENT_ID`** — Replace `hdfcmaster` with your production Client ID
> 3. **`HDFC_API_KEY`** — Replace sandbox key with production API key
> 4. **`HDFC_BASE_URL`** — Change from `hdfcuat.bank.in` to the production URL
> 5. **`HDFC_RETURN_URL`** — Update to your production domain (e.g., `https://billsoft.agbitsolutions.com/payment-response`)
> 6. **`HDFC_ENV`** — Change from `sandbox` to `production`
> 7. **`paymentPageClientId`** in `paymentUtils.ts` — Update from `"hdfcmaster"` to production Client ID
> 8. **RSA Keys** — Replace placeholder keys with actual production RSA key pair

### File Inventory Summary

| Layer | File | Purpose |
|-------|------|---------|
| **Config** | `.env` | HDFC credentials, URLs, keys |
| **Backend Service** | `src/services/paymentService.ts` | HDFC API communication (session, verify, refund) |
| **Backend Routes** | `src/routes/payments.ts` | REST endpoints (create-session, verify) |
| **Backend Entry** | `src/index.ts` | Mounts `/api/payments` router |
| **Frontend Utility** | `src/utils/paymentUtils.ts` | SDK loader + checkout initiator |
| **Frontend Page** | `src/pages/Payment.tsx` | Subscription plan selection + checkout |
| **Frontend Page** | `src/pages/PaymentResponse.tsx` | Post-payment verification & status display |
| **Frontend Page** | `src/pages/Pricing.tsx` | Public pricing page with integrated checkout |
| **Frontend Page** | `src/pages/SubscriptionManagement.tsx` | Admin plan overview & upgrade navigation |
| **Frontend Component** | `src/components/bills/PaymentButton.tsx` | Inline bill payment button |
| **Frontend Routing** | `src/App.tsx` | Route definitions for all payment pages |
| **Database** | `prisma/schema.prisma` | `PlanType` enum, `User.planType`, `User.planExpiresAt` |
