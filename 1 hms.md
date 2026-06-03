# Hospital Management System (HMS) – Complete Development Prompt

You are a senior full-stack software architect and developer.

Build a complete, production-ready Hospital Management System suitable for clinics, polyclinics, diagnostic centers, and hospitals.

## Core Technology Requirements

Frontend:

* React + TypeScript
* Vite
* Tailwind CSS
* Shadcn UI
* React Query
* React Hook Form
* Zod Validation

Backend:

* NestJS (preferred) or Express TypeScript

Database:

* PostgreSQL

Authentication:

* Standard Email/Password Authentication
* JWT Authentication
* Refresh Tokens
* RBAC (Role Based Access Control)

Deployment:

* Docker Containers
* Docker Compose
* Coolify Compatible
* Cloudflare Compatible
* Works on VPS, AWS, Azure, Oracle Cloud, Render, Railway

## PostgreSQL Schema Architecture

Create separate schemas:

auth
master
patients
opd
billing
pharmacy
laboratory
radiology
documents
audit
reports
settings

Never mix all tables into a single schema.

System should support future expansion.

## Authentication Module

### Registration

Fields:

* Full Name
* Email
* Mobile Number
* Password
* Confirm Password

### Login

Fields:

* Email
* Password

Features:

* Remember Me
* JWT
* Refresh Token

### Forgot Password

* Email Reset Link
* Password Reset
* Token Expiry

### User Roles

Super Admin
Hospital Admin
Doctor
Receptionist
Nurse
Pharmacist
Lab Staff
Radiology Staff
Accountant
Viewer

Role permissions must be configurable.

---

# OPD Consultation Module

Single smart OPD workflow.

## Features

Search existing patient before registration.

Search by:

* UHID
* Mobile Number
* Patient Name
* OPD Number

If patient exists:

* Open Existing Profile

If not:

* New Registration

### OPD Form

Patient Registration

Vitals

Consultation

Diagnosis

Prescription

Investigations

Billing

Follow-up

All in one workflow.

---

# Patient Management

## Patient Master

Store:

* UHID
* Name
* Gender
* DOB
* Age
* Mobile
* Address
* Blood Group
* Occupation
* Aadhaar (Optional)
* Emergency Contact
* Marital Status

### Features

Search

View

Edit

Merge Duplicate Patients

Archive Patient

Print Patient Card

Export Data

Soft Delete Only

No permanent deletion.

---

# Patient Profile Dashboard

## Personal Information

* UHID
* Photo
* Name
* Gender
* DOB
* Age
* Mobile

## Medical Information

* Allergies
* Chronic Diseases
* Family History
* Surgical History
* Current Medications

## Statistics

* Total Visits
* First Visit
* Last Visit
* Total Bills
* Outstanding Amount

## History Tabs

* Visit History
* Prescription History
* Investigation History
* Billing History
* Uploaded Documents
* Timeline

---

# Doctor Management

Store:

* Doctor ID
* Name
* Qualification
* Registration Number
* Department
* Specialization
* Mobile
* Email
* Consultation Fees
* Signature

Features:

* Schedule
* Patients Seen
* Revenue Reports
* Prescription Analytics

---

# Department Management

Support:

* General Medicine
* Pediatrics
* Gynecology
* Orthopedics
* Surgery
* ENT
* Dermatology
* Cardiology

Unlimited custom departments.

---

# Prescription Management

Medicine Search While Typing

Store:

* Medicine Name
* Generic Name
* Brand Name
* Strength
* Dosage
* Frequency
* Duration
* Route
* Instructions

Outputs:

* Print Prescription
* PDF
* WhatsApp

---

# Investigation Management

Support:

Laboratory

Radiology

Examples:

* CBC
* LFT
* KFT
* Thyroid Profile
* X-Ray
* MRI
* CT Scan

Functions:

* Add Test
* Edit Test
* Upload Report
* View Report
* Investigation History

---

# Billing Module

Consultation Billing

Investigation Billing

Pharmacy Billing

Custom Billing

Fields:

* Item
* Quantity
* Rate
* Discount
* Tax
* Total

Payment Modes:

* Cash
* UPI
* Card
* Bank Transfer

Outputs:

* Invoice
* PDF
* WhatsApp

---

# Pharmacy Module

Medicine Master

Store:

* Generic Name
* Brand Name
* Strength
* Manufacturer
* Batch Number
* Expiry Date
* Purchase Price
* Selling Price
* Stock

Features:

* Purchase Entry
* Sale Entry
* Stock Adjustment
* Low Stock Alerts
* Expiry Alerts

---

# Laboratory Module

Lab Test Master

Test Categories

Sample Collection

Result Entry

PDF Reports

History Tracking

---

# Radiology Module

Radiology Orders

Report Upload

Image Attachment

History Tracking

---

# Medical Records

Store:

* Consultation Notes
* Diagnoses
* Prescriptions
* Reports
* Documents
* Images

All linked to patient profile.

---

# Patient Timeline

Example:

Patient Registered

OPD Consultation

Prescription Issued

Investigation Ordered

Bill Generated

Follow-up Visit

Investigation Uploaded

Display chronological timeline.

---

# Reporting & Analytics

Patient Reports

* Daily Patients
* Monthly Patients
* Follow-ups

Financial Reports

* Revenue
* Collections
* Outstanding

Doctor Reports

* Doctor-wise Patients
* Doctor-wise Revenue

Investigation Reports

* Lab Revenue
* Test Statistics

Pharmacy Reports

* Stock
* Expiry
* Sales

---

# Audit & Security

Track:

* Login History
* User Activity
* Data Changes
* IP Address

Store:

* Old Value
* New Value
* Timestamp
* User

---

# File Management

Upload:

* Reports
* Prescriptions
* Images
* PDFs
* Scanned Documents

Store metadata separately.

---

# Soft Delete

Never permanently delete.

Use:

* is_deleted
* deleted_at
* deleted_by

---

# Dashboard

Show:

* Today's Patients
* Today's Revenue
* Pending Bills
* Follow-up Patients
* Lab Reports Pending
* Low Stock Medicines
* Recent Activities

---

# Docker Requirements

Provide:

* Dockerfile Frontend
* Dockerfile Backend
* Docker Compose

Containers:

* Frontend
* Backend
* PostgreSQL

Run using:

docker compose up -d

---

# Deliverables

Generate:

1. Complete PostgreSQL Schema
2. ER Diagram
3. API Design
4. Folder Structure
5. Docker Configuration
6. Authentication Flow
7. RBAC Design
8. Audit Design
9. Dashboard Design
10. Complete Source Code

The application must be production-ready, scalable, secure, and deployable on any environment without vendor lock-in.
