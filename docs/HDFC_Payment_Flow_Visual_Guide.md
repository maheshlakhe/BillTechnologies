# 🎯 HDFC Smart Gateway Payment Flow: End-to-End Implementation & Testing

- **Author:** AGBTechnologies LLP
- **Date:** 04/15/2026
- **Company:** AGBTechnologies LLP — [agbtechnologies.com](https://agbtechnologies.com)
- **Project:** BillSoft
- **Gateway:** HDFC SmartGateway (powered by Juspay)
- **Environment:** UAT / Sandbox

---

## 📌 Goal

To verify that the **complete payment lifecycle** is working correctly — from order creation to final payment confirmation — using HDFC SmartGateway in the sandbox environment.

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

## 📸 1. BillSoft Platform — Landing Page

The BillSoft platform is India's #1 billing software for all business needs.

![BillSoft Landing Page](docs/images/image1.png)

---

## 📸 2. Pricing Plans — Subscription Tiers

Users can view available subscription plans directly from the public-facing pricing page.

![BillSoft Pricing Page](docs/images/image2.png)

**Available Plans:**

| Plan | Price | Billing | API Plan ID |
|------|-------|---------|-------------|
| Free Plan | ₹0 | Forever | `FREE` |
| Starter | ₹399 | Monthly | `STARTER` |
| Growth ⭐ | ₹999 | Monthly | `GROWTH` |
| Pro | ₹2,499 | Monthly | `PRO` |
| Enterprise | Custom | Contact Sales | `ENTERPRISE` |

> 💡 **Note:** The "Secure payment processed via HDFC Smartgateway (Juspay)" badge is displayed at the bottom of the pricing page for trust.

---

## 📸 3. User Registration — Create Account

New users register by creating an organization with admin access.

![BillSoft Registration Form](docs/images/image3.png)

**Registration Fields:**
- Company / Organization Name
- Organization Size
- Full Name, Email Address, Phone Number
- Password (Max 16 characters)

After registration, the user receives a verification email before accessing the dashboard.

---

## 📸 4. Admin Dashboard — Overview (Before Payment)

After login, the admin sees the main dashboard with business metrics. Notice the plan badge shows **"FREE ₹"** in the top-right corner.

![BillSoft Dashboard](docs/images/image4.png)

**Dashboard Features:**
- Net Profit, Total Expenses, Total Revenue
- Total Bills, Active Customers, Products count
- Recent Bills list with PAID status
- Quick Actions: Create Bill, Add Customer, Add Product

---

## 📸 5. Dashboard — Plan Badge Highlighted

The **FREE ₹** badge in the top-right corner indicates the current subscription plan. Clicking this navigates to the subscription management page.

![Dashboard with FREE plan badge highlighted](docs/images/image5.png)

---

## 📸 6. Admin Panel — System Management

The Admin Panel provides access to all management features including **Subscription & Plans**.

![Admin Panel](docs/images/image6.png)

**Admin Modules:**
| Module | Description |
|--------|-------------|
| User Management | Manage user accounts, roles, and permissions |
| Technician Management | Assign service ticket handlers |
| **Subscription & Plans** | **Manage pricing tiers, billing cycle, and feature toggles** |
| Invoice Template Library | Manage invoice designs and formats |
| Audit Logs | View system activity and user actions history |

---

## 📸 7. Admin Panel — Subscription & Plans (Highlighted)

Clicking **"Subscription & Plans"** (highlighted with red box) opens the subscription management page.

![Admin Panel with Subscription & Plans highlighted](docs/images/image7.png)

---

## 📸 8. Subscription Management — Current Plan Details

The Subscription page shows the **current plan status**, billing cycle, usage, and feature toggles. The **"Upgrade Plan"** button (highlighted in red) initiates the HDFC payment flow.

![Subscription & Plans page with Upgrade Plan button highlighted](docs/images/image8.png)

**Current Plan Details:**
| Field | Value |
|-------|-------|
| Plan Name | FREE Plan |
| Status | ✅ Active |
| Billing Cycle | Monthly |
| Next Renewal | N/A |
| Plan Price | ₹0 |
| Monthly Usage | 0 / 50 |

**Feature Management (Right Panel):**
| Feature | Status |
|---------|--------|
| Invoice Customization | 🔴 Disabled |
| GST Ready (Advantage) | 🔴 Disabled |
| Inventory Management | 🔴 Disabled |
| Multi-User Roles | 🔴 Disabled |
| API Access | 🔴 Disabled |
| Audit Logs | 🔴 Disabled |
| Advanced Analytics | 🔴 Disabled |

> 🔑 **These features unlock automatically when the user upgrades to a paid plan.**

---

## 📸 9. Upgrade Your Plan — Payment Page (HDFC Flow Starts Here)

Clicking **"Upgrade Plan"** opens the plan selection page. The user selects a plan and clicks **"Upgrade to {Plan}"** — this triggers the HDFC SmartGateway payment session.

![Upgrade Your Plan page with all plan options](docs/images/image9.png)

**What happens when "Upgrade to Growth" is clicked:**
1. Frontend calls `POST /api/payments/create-subscription-session` with `{"plan": "GROWTH"}`
2. Backend creates order on HDFC SmartGateway → gets `sdk_payload` + `payment_links`
3. Frontend loads Juspay SDK → opens overlay checkout
4. If SDK fails → auto-redirects to hosted payment page (`payment_links.web`)

---

## 🔧 API Configuration

### Backend Environment (`.env`)

```env
HDFC_MERCHANT_ID=SG4887
HDFC_CLIENT_ID=hdfcmaster          # MUST be "hdfcmaster" in Sandbox!
HDFC_API_KEY=233A2AF46DB453B944CBA1AB49F922
HDFC_BASE_URL=https://smartgateway.hdfcuat.bank.in
HDFC_RETURN_URL=http://192.168.1.13:5001/api/payments/handle-response
HDFC_ENV=sandbox
```

---

## 📮 POSTMAN API TEST FLOW

### Import Files (in `/postman` folder):
```
postman/BillSoft_HDFC_Payments.postman_collection.json
postman/BillSoft_HDFC_Local.postman_environment.json
```

---

### 🧪 STEP 1: Health Check

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:5001/api/health` |

**✅ Response:**
```json
{
    "status": "OK",
    "message": "BillSoft API Server is running"
}
```

---

### 🧪 STEP 2: Login (Get JWT Token)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:5001/api/auth/login` |
| **Headers** | `Content-Type: application/json` |

**Body:**
```json
{
    "email": "your@email.com",
    "password": "yourpassword"
}
```

**✅ Response:**
```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": "clxxxx1234",
        "email": "your@email.com",
        "planType": "FREE"
    }
}
```

> 📋 Copy the `token` value → Use as `Authorization: Bearer {token}` in next requests.

---

### 🧪 STEP 3: Create Payment Session (MOST IMPORTANT)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:5001/api/payments/create-subscription-session` |
| **Headers** | `Content-Type: application/json`, `Authorization: Bearer {token}` |

**Body:**
```json
{
    "plan": "GROWTH"
}
```

**✅ Response:**
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

---

### 🌐 STEP 4: Open Payment Link in Browser

Copy `payment_links.web` URL → Open in browser → HDFC checkout page appears.

### 💳 STEP 5: Complete Test Payment

**Sandbox Test Cards:**

| Card | Number | Expiry | CVV |
|------|--------|--------|-----|
| Visa | `4111 1111 1111 1111` | Any future | `123` |
| Mastercard | `5500 0000 0000 0004` | Any future | `123` |

---

### 🔁 STEP 6: Callback (Automatic)

HDFC POSTs to `http://localhost:5001/api/payments/handle-response` → Backend redirects to frontend.

---

### 🧪 STEP 7: Verify Payment Status

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:5001/api/payments/verify/{order_id}` |

**✅ Response:**
```json
{
    "success": true,
    "status": "PAID",
    "type": "SUBSCRIPTION",
    "plan": "GROWTH"
}
```

**After verification:**
- ✅ `User.planType` updated to `GROWTH`
- ✅ `User.planExpiresAt` set to `NOW + 30 days`
- ✅ All Growth features unlocked in Feature Management

---

## 🔥 COMPLETE FLOW SUMMARY

```
📸 1. User lands on BillSoft website
📸 2. Views pricing plans
📸 3. Registers a new account
📸 4. Logs into dashboard (FREE plan)
📸 5. Notices FREE badge → wants to upgrade
📸 6. Goes to Admin Panel
📸 7. Clicks "Subscription & Plans"
📸 8. Sees current plan + "Upgrade Plan" button
📸 9. Selects Growth plan → triggers HDFC payment
     → Postman: /create-subscription-session
     → Opens HDFC checkout → enters card
     → HDFC callback → Backend verifies
     → Plan activated! 🎉
```

---

## 🛠️ Troubleshooting

| # | Issue | Cause | Fix |
|---|-------|-------|-----|
| 1 | `401 Unauthorized` | Token expired | Re-login to get fresh JWT |
| 2 | `Invalid Client ID` | Wrong Client ID in sandbox | Use `hdfcmaster` |
| 3 | Payment link expired | Session timeout (~30 min) | Create new session |
| 4 | `Cannot POST /payment-response` | Callback hitting frontend | Return URL must point to backend |
| 5 | Plan not activating | Verify not called | Call `GET /api/payments/verify/{orderId}` |

---

## ✅ Production Checklist

| # | Config | Sandbox | Production |
|---|--------|---------|------------|
| 1 | `HDFC_MERCHANT_ID` | `SG4887` | _(production ID)_ |
| 2 | `HDFC_CLIENT_ID` | `hdfcmaster` | _(real Client ID)_ |
| 3 | `HDFC_BASE_URL` | `smartgateway.hdfcuat.bank.in` | `smartgateway.hdfc.bank.in` |
| 4 | `HDFC_RETURN_URL` | `localhost:5001/...` | `api.yourdomain.com/...` |
| 5 | `FRONTEND_URL` | `localhost:3000` | `yourdomain.com` |

---

## 📁 Files in This Package

```
billsoft_saas/
├── docs/
│   └── images/                                        ← All screenshots (image1-9.png)
├── postman/
│   ├── BillSoft_HDFC_Payments.postman_collection.json ← Import into Postman
│   └── BillSoft_HDFC_Local.postman_environment.json   ← Import into Postman
├── HDFC_Payment_Flow_Visual_Guide.md                   ← This document
├── HDFC_Payment_Flow_Testing_Document.md               ← Detailed API testing doc
├── HDFC_SmartGateway_Payment_Flow.md                   ← Full technical reference
└── backend/
    ├── .env                                            ← HDFC credentials
    ├── src/routes/payments.ts                          ← API endpoints
    └── src/services/paymentService.ts                  ← HDFC API calls
```

---

> **Prepared by:** AGBTechnologies LLP  
> **Contact:** agbitsolutions247@gmail.com  
> **Date:** April 15, 2026
