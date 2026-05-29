# 🎯 HDFC Smart Gateway Payment Flow: End-to-End Implementation & Testing

- **Author:** Mahesh Lakhe
- **Date:** 04/15/2026
- **Company:** AGBTechnologies LLP — [agbtechnologies.com](https://agbtechnologies.com)
- **Project:** BillSoft SaaS Platform
- **Gateway:** HDFC SmartGateway (powered by Juspay)
- **Environment:** UAT / Sandbox

---

## 📌 Goal

To verify that the **complete payment lifecycle** is working correctly — from order creation to final payment confirmation — using HDFC SmartGateway.

---

## 🔄 End-to-End Flow Overview

```
Postman → /session → payment link → browser payment → callback → status check
```

### 🎯 Flow Test Status

```
Postman  → /session         ✅ Session Created
         → payment link     ✅ Link Generated  
         → browser payment  ✅ Payment Completed
         → callback         ✅ Redirect Working
         → status check     ✅ CHARGED Confirmed
```

---

## 🔧 Configuration

### API Base URL

| Environment | Backend URL |
|-------------|-------------|
| **Local Development** | `http://localhost:5001` |
| **Network (LAN)** | `http://192.168.1.13:5001` |

### HDFC Sandbox Credentials

| Parameter | Value |
|-----------|-------|
| **Merchant ID** | `SG4887` |
| **Client ID** | `hdfcmaster` _(mandatory for sandbox)_ |
| **API Key** | `233A2AF46DB453B944CBA1AB49F922` |
| **Base URL** | `https://smartgateway.hdfcuat.bank.in` |
| **Return / Callback URL** | `http://localhost:5001/api/payments/handle-response` |

> ⚠️ **Critical:** `payment_page_client_id` MUST be `hdfcmaster` in Sandbox. Your real Client ID will not work.

---

## 📮 POSTMAN SETUP (START HERE)

### Step A — Import the Collection & Environment

Two ready-to-import files are provided in the `/postman` folder of the project:

```
d:\billsoft\rushbh\billsoft_saas\postman\
  ├── BillSoft_HDFC_Payments.postman_collection.json   ← Import this
  └── BillSoft_HDFC_Local.postman_environment.json     ← Import this
```

#### Import Steps:
1. Open **Postman**
2. Click **Import** (top-left)
3. Drag & drop **both files** at once, OR click "Upload Files" and select them
4. Both will appear — click **Import**
5. In the top-right environment dropdown → select **"BillSoft HDFC — Local Dev"**

---

### Step B — Configure Your Credentials

In Postman, open **Environments → BillSoft HDFC — Local Dev** and update:

| Variable | Set To |
|----------|--------|
| `user_email` | Your BillSoft login email |
| `user_password` | Your BillSoft login password |

> All other variables (`auth_token`, `order_id`, `payment_web_url`) are **auto-filled** by the test scripts.

---

### Step C — Collection Structure

The collection is organized into 4 folders — **run in order:**

```
📁 BillSoft — HDFC SmartGateway Payments
│
├── 🔐 0. Auth
│   ├── 0.1 Health Check
│   ├── 0.2 Login  ← Run First! (auto-saves JWT token)
│   └── 0.3 Get My Profile
│
├── 💳 1. Create Payment Session
│   ├── 1.1 Create Session — STARTER Plan (₹399)
│   ├── 1.2 Create Session — GROWTH Plan (₹999)  ← Recommended for testing
│   ├── 1.3 Create Session — PRO Plan (₹2,499)
│   ├── 1.4 ❌ No Auth (Expect 401)
│   └── 1.5 ❌ Invalid Plan (Expect 400)
│
├── ✅ 2. Verify Payment Status
│   ├── 2.1 Verify Order (auto uses saved order_id)
│   ├── 2.2 Verify Order (manual order_id)
│   └── 2.3 ❌ Verify Invalid Order
│
└── 🛠️ 3. System Utilities
    ├── 3.1 Payments Router Health
    ├── 3.2 System Test Connection
    └── 3.3 Show Saved Variables 
```

---

## 🧪 STEP 1: HEALTH CHECK + LOGIN

### 0.1 Health Check
Verify the server is running before anything else.

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:5001/api/health` |

**Expected Response:**
```json
{
    "status": "OK",
    "message": "BillSoft API Server is running"
}
```

---

### 0.2 Login (Auto-saves JWT Token)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:5001/api/auth/login` |
| **Headers** | `Content-Type: application/json` |

**Body (JSON):**
```json
{
    "email": "{{user_email}}",
    "password": "{{user_password}}"
}
```

**Expected Response:**
```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": "clxxxx1234",
        "email": "test@example.com",
        "planType": "FREE"
    }
}
```

> 🤖 **Automatic:** The test script extracts `token` and saves it as `{{auth_token}}` in the environment. Every subsequent request uses this automatically.

---

## 🧪 STEP 2: CREATE PAYMENT SESSION (MOST IMPORTANT)

### 1.2 Create Session — GROWTH Plan (Recommended)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:5001/api/payments/create-subscription-session` |
| **Headers** | `Content-Type: application/json`, `Authorization: Bearer {{auth_token}}` |

**Body (JSON):**
```json
{
    "plan": "GROWTH"
}
```

**Available Plans:**

| Plan | Body Value | Amount | Validity |
|------|-----------|--------|---------|
| Starter | `"STARTER"` | ₹399 | 30 days |
| Growth ⭐ | `"GROWTH"` | ₹999 | 30 days |
| Pro | `"PRO"` | ₹2,499 | 365 days |

**Expected Response:**
```json
{
    "success": true,
    "order_id": "SUB-GROWTH-clxxxx1234-1713168000000",
    "payment_links": {
        "web": "https://smartgateway.hdfcuat.bank.in/pay/..."
    },
    "sdk_payload": { "..." }
}
```

> 🤖 **Automatic:** Test script saves `order_id` and `payment_links.web` to environment variables for reuse.

---

## 🌐 STEP 3: OPEN PAYMENT LINK IN BROWSER

After running Step 2, check the Postman **Console** (bottom bar → Console):

```
✅ Order ID saved: SUB-GROWTH-clxxxx1234-1713168000000
🌐 Open in browser: https://smartgateway.hdfcuat.bank.in/pay/...
```

**👉 Copy that URL → Open in Browser**

Or check the environment variable `payment_web_url` in the Environment sidebar.

---

## 💳 STEP 4: COMPLETE TEST PAYMENT

On the HDFC hosted payment page, use these test credentials:

### Sandbox Test Cards

| Card Network | Card Number | Expiry | CVV |
|-------------|-------------|--------|-----|
| **Visa** | `4111 1111 1111 1111` | Any future date | `123` |
| **Mastercard** | `5500 0000 0000 0004` | Any future date | `123` |
| **RuPay** | `6061 1111 1111 1111` | Any future date | `123` |
| **Net Banking** | Select any bank | N/A | N/A |

**Steps:**
1. Enter card number, expiry, CVV
2. Click **Pay Now**
3. Complete OTP if prompted (sandbox may auto-approve)
4. Payment processing completes → HDFC redirects to our callback URL

---

## 🔁 STEP 5: CALLBACK (AUTO — HDFC CALLS YOUR BACKEND)

After payment, HDFC **automatically calls:**
```
POST http://localhost:5001/api/payments/handle-response
```

The backend:
1. Reads `order_id` and `status` from the POST body
2. Issues a **302 redirect** to the frontend

| Payment Status | Redirect |
|---------------|----------|
| `CHARGED` | `http://localhost:3000/payment-response?order_id={id}` |
| `FAILED` | `http://localhost:3000/payment-response?order_id={id}&status=failed&reason={reason}` |

### 📮 Simulate Callback in Postman (Manual Test)

You can **simulate** HDFC's callback using request **3.1**:

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:5001/api/payments/handle-response` |
| **Body** | `form-data` or `x-www-form-urlencoded` |

**Body Parameters:**
```
order_id   = {{order_id}}
status     = CHARGED
status_id  = 21
merchant_id= SG4887
amount     = 999.0
currency   = INR
```

---

## 🧪 STEP 6: VERIFY PAYMENT STATUS

### 2.1 Verify Order

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:5001/api/payments/verify/{{order_id}}` |
| **Auth** | None required |

**Success Response:**
```json
{
    "success": true,
    "status": "PAID",
    "type": "SUBSCRIPTION",
    "plan": "GROWTH"
}
```

**What happens behind the scenes on success:**
- ✅ Backend calls HDFC Order API to confirm `CHARGED` status
- ✅ Extracts plan and userId from the `order_id` string
- ✅ Updates `User.planType = 'GROWTH'`
- ✅ Sets `User.planExpiresAt = NOW() + 30 days`
- ✅ Returns `{ success: true, status: "PAID", plan: "GROWTH" }`

---

## 🔥 COMPLETE TEST FLOW — SUMMARY

```
┌─────────────────────────────────────────────────────┐
│  POSTMAN FLOW                                       │
│                                                     │
│  [0.1] GET  /api/health          → ✅ Server OK    │
│  [0.2] POST /api/auth/login      → 💾 Token saved  │
│  [0.3] GET  /api/auth/profile    → 📋 Plan: FREE   │
│                                                     │
│  [1.2] POST /api/payments/       → 💾 order_id     │
│             create-subscription  → 🌐 payment URL  │
│                                                     │
│  ── BROWSER ──────────────────────────────────────  │
│  Open payment_links.web          → HDFC checkout   │
│  Enter test card + submit        → Payment done    │
│  HDFC calls /api/payments/       → Backend handles │
│             handle-response      → 302 → frontend  │
│  ────────────────────────────────────────────────── │
│                                                     │
│  [2.1] GET  /api/payments/       → ✅ PAID         │
│             verify/{{order_id}}  → 🎉 Plan active  │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Test Assertions in the Collection

Each request in the collection has automated tests built-in:

| Request | What's Tested |
|---------|--------------|
| Health Check | Status 200, `status === 'OK'` |
| Login | Status 200, `token` is string, auto-saved |
| Create Session | Status 200, `success === true`, `order_id` present, links present |
| No-Auth Session | Status 401 returned |
| Invalid Plan | Status 400, error message includes "Invalid plan" |
| Verify Order | Status 200, logs status/plan to console |
| Invalid Order | Status 200, `success === false` |
| Callback Success | Status 302, `Location` header contains `order_id` |
| Callback Failed | Status 302, `Location` contains `status=failed` |

---

## 🛠️ Troubleshooting

| # | Issue in Postman | Cause | Fix |
|---|----------|-------|-----|
| 1 | `401 Unauthorized` on session | Token expired or not set | Re-run `0.2 Login` |
| 2 | `{{auth_token}}` shows literally | Environment not selected | Select "BillSoft HDFC — Local Dev" from dropdown |
| 3 | `400 Invalid plan` | Wrong plan name | Use `STARTER`, `GROWTH`, or `PRO` (uppercase) |
| 4 | `Connection refused` | Server not running | Start backend with `npm run dev` in `/backend` |
| 5 | Payment link 404 | Expired session | Re-run Create Session (links expire in ~30 min) |
| 6 | Callback returns 404 | Wrong return_url | Set `HDFC_RETURN_URL=http://localhost:5001/api/payments/handle-response` in `.env` |
| 7 | `ECONNREFUSED` on port 5001 | Wrong port | Check `.env` — `SERVER_PORT=5001` |

---

## 📋 Postman Environment Variables Reference

| Variable | How It's Set | Used In |
|----------|-------------|---------|
| `base_url` | Manual (pre-set) | Every request |
| `user_email` | Manual (you set) | Login request |
| `user_password` | Manual (you set) | Login request |
| `auth_token` | **Auto** — Login script | All `Authorization: Bearer {{auth_token}}` |
| `order_id` | **Auto** — Create Session script | Verify, Callback requests |
| `payment_web_url` | **Auto** — Create Session script | Open in browser for payment |
| `user_id` | **Auto** — Profile script | Reference only |
| `last_verified_plan` | **Auto** — Verify script | Reference only |

---

## ✅ Production Deployment Checklist

| # | Config | Sandbox Value | Production Value |
|---|--------|---------------|------------------|
| 1 | `HDFC_MERCHANT_ID` | `SG4887` | _(production ID from HDFC)_ |
| 2 | `HDFC_CLIENT_ID` | `hdfcmaster` | _(production Client ID)_ |
| 3 | `HDFC_API_KEY` | `233A2AF46DB4...` | _(production API key)_ |
| 4 | `HDFC_BASE_URL` | `https://smartgateway.hdfcuat.bank.in` | `https://smartgateway.hdfc.bank.in` |
| 5 | `HDFC_RETURN_URL` | `http://localhost:5001/api/payments/handle-response` | `https://api.yourdomain.com/api/payments/handle-response` |
| 6 | `FRONTEND_URL` | `http://localhost:3000` | `https://yourdomain.com` |
| 7 | `paymentPageClientId` in code | `"hdfcmaster"` | _(production Client ID)_ |
| 8 | `base_url` in Postman env | `http://localhost:5001` | `https://api.yourdomain.com` |

---

## 📁 Files in This Package

```
d:\billsoft\rushbh\billsoft_saas\
│
├── postman\
│   ├── BillSoft_HDFC_Payments.postman_collection.json    ← Import into Postman
│   └── BillSoft_HDFC_Local.postman_environment.json      ← Import into Postman
│
├── HDFC_Payment_Flow_Testing_Document.md                  ← This document
├── HDFC_SmartGateway_Payment_Flow.md                      ← Full technical doc
│
└── backend\
    ├── .env                                               ← HDFC credentials
    ├── src\routes\payments.ts                             ← API endpoints
    └── src\services\paymentService.ts                     ← HDFC API calls
```

---

> **Prepared by:** Mahesh Lakhe  
> **Company:** AGBTechnologies LLP  
> **Contact:** agbitsolutions247@gmail.com  
> **Date:** April 15, 2026
