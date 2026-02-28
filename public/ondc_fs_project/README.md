# 🚀 ONDC Financial Services Integration Project

## 📌 Project Overview

This project simulates an ONDC Financial Services loan workflow system.

It allows:

- Users to apply for a loan
- Admin to monitor applications
- Secure webhook-based status updates
- Real-time loan status tracking
- Secure API validation using Secret Key
- Logging for audit & debugging

The system is built using:

- PHP (Core PHP)
- MySQL
- XAMPP (Local Server)
- ngrok (Public webhook testing)
- Postman (API Testing)

---

# 🏗️ System Architecture

User → Apply Loan → Lead Created → Loan Application Created  
ONDC System → Sends Webhook → Status Updated  
Admin → Views Dashboard  

---

# 🌐 How To Run Project Locally

## 1️⃣ Start XAMPP
- Start Apache
- Start MySQL



## open Loan part at rupkisha through humra mall
http://localhost/ondc_fs_project/?route=loan_sdk




## 2️⃣ Open Browser

Php myadmin for show our db part 
http://localhost/phpmyadmin/index.php?route=/database/structure&db=ondc_fs_db

Main Application:
http://localhost/ondc_fs_project/

Apply Loan Page:
http://localhost/ondc_fs_project/?route=apply_loan

Loan Status Page:
http://localhost/ondc_fs_project/?route=loan_status

Admin Login:
http://localhost/ondc_fs_project/?route=login

Admin Dashboard:
http://localhost/ondc_fs_project/?route=admin_dashboard

---

# 👤 User Flow

## 🔹 Step 1: Apply for Loan

User fills:
- Name
- Phone
- Email

System:
- Creates entry in `leads` table
- Creates entry in `loan_applications` table
- Generates tracking ID

---

## 🔹 Step 2: Webhook Update

Webhook Endpoint:

Local:
http://localhost/ondc_fs_project/webhook/ondc_webhook.php

Using ngrok:
https://your-ngrok-url/ondc_fs_project/webhook/ondc_webhook.php

Webhook requires secure header:

Key: X-API-KEY  
Value: b49fe7cd4bf35a9c7ca6c540ffd485290a04f51abc2619a70d51c6ec73bec35d

Example JSON Body:

```json
{
  "tracking_id": "TRK_xxxxx",
  "referenceId": "REF999999",
  "status": "approved",
  "amount": "75000",
  "lender_name": "HDFC Bank",
  "interest_rate": "12%"
}
```

System:
- Verifies secret key
- Matches tracking ID
- Updates loan status
- Saves lender & offer details

---

# 👨‍💼 Admin Panel

Login URL:
http://localhost/ondc_fs_project/?route=login

Admin Features:
- View all loan applications
- See status (Approved / Rejected / Pending)
- See lender details
- Logout securely

---

# 🔐 Security Features

- API Key validation for webhook
- Header-based authentication
- Prepared statements (SQL Injection prevention)
- Error logging
- Session-based admin authentication

---

# 🗂️ Project Folder Structure

```
config/
    database.php
    ondc.php

controllers/
    LeadController.php
    LoanController.php
    StatusController.php
    WebhookController.php

services/
    OndcService.php

views/
    apply_loan.php
    loan_status.php
    loan_sdk.php
    admin_dashboard.php
    login.php

webhook/
    ondc_webhook.php

logs/
    app.log
    ondc.log

index.php
routes.php
README.md
```

---

# 📊 Database Tables

## leads
- id
- name
- phone
- email
- tracking_id
- created_at

## loan_applications
- id
- lead_id
- reference_id
- status
- offer_amount
- lender_name
- interest_rate
- updated_at
- created_at

---

# 🧪 Testing Checklist

✔ Apply loan  
✔ Check database entry  
✔ Send webhook via Postman  
✔ Verify status update  
✔ Check Admin Dashboard  
✔ Test security (Remove API key → Should return 401)

---

# 🎯 Project Status

Backend Logic: 100%  
Webhook Integration: 100%  
Security: 100%  
Admin Dashboard: 100%  
UI Polish: 100%  

Project Completion: ✅ FULLY COMPLETE

---

# 👨‍💻 Developed By

Raushan Kumar  
B.S. Computer Science & Data Analytics  
IIT Patna  

ONDC FS Integration Simulation Project

---

# 🏁 Final Notes

This project demonstrates:

- Backend architecture
- API handling
- Secure webhook processing
- Session-based authentication
- Real-time status tracking
- Professional development workflow
