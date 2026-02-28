# ONDC FS Loan Integration API Documentation

## 1. Webhook Endpoint

URL:
POST /webhook/ondc_webhook.php

Sample Payload:
{
  "tracking_id": "TRK_699becd398955",
  "referenceId": "REF123456",
  "status": "approved",
  "amount": "50000",
  "lender_name": "HDFC Bank",
  "interest_rate": "12%"
}

Response:
{
  "message": "Webhook received"
}

---

## 2. Loan Status Page

URL:
routes.php?route=loan_status&phone=9504961730

Displays:
- Reference ID
- Status
- Offer amount
- Lender name
- Interest rate

---

## 3. Admin Login

URL:
routes.php?route=login

Username: admin
Password: admin123

---

## 4. Admin Dashboard

URL:
routes.php?route=admin_dashboard

Displays all loan applications.