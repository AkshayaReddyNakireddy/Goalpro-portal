# GoalPro – Enterprise Goal Management & Performance Tracking Portal

## Overview

GoalPro is a web-based enterprise performance management platform designed to streamline organizational goal setting, quarterly achievement tracking, managerial reviews, governance workflows, and KPI monitoring across multiple user roles.

The portal enables Employees, Managers, and Admin/HR teams to collaborate within a structured performance cycle while ensuring transparency, accountability, auditability, and real-time reporting.

The application is built using React + Vite for the frontend, Firebase Authentication for secure login management, Firestore Database for real-time cloud storage, and deployed on Vercel for scalable web hosting.

---

# Problem Statement

Organizations often face challenges in:

* Tracking employee goals consistently
* Managing quarterly performance reviews
* Monitoring achievement progress across teams
* Maintaining audit records for governance
* Handling shared departmental KPIs
* Providing real-time analytics and reporting visibility

GoalPro addresses these challenges through a centralized role-based performance management portal.

---

# Core Features

## 1. Role-Based Access Control

The system supports three distinct organizational roles:

### Employee

Employees can:

* Create and edit goals during the active goal-setting cycle
* Submit goals for manager approval
* Update quarterly achievements
* Track planned vs actual progress
* View locked goals after approval
* Update progress status:

  * Not Started
  * On Track
  * Completed

### Manager (L1)

Managers can:

* Review employee goals
* Approve or reject submitted goals
* Return goals for rework
* Edit targets inline during reviews
* Conduct quarterly check-ins
* Add structured manager feedback/comments
* Monitor team goal completion

### Admin / HR

Admins can:

* Monitor organizational completion rates
* View analytics dashboards
* Unlock locked goals for exceptions
* Track audit logs and governance records
* Export achievement reports in CSV format
* Access enterprise-wide KPI visibility
* Create and manage Shared KPIs

---

# Goal Lifecycle Workflow

## Phase 1 – Goal Creation

Employees create goals containing:

* Goal title
* Planned target
* Weightage
* KPI information
* Description
* Thrust Area

Goals remain editable until submission.

---

## Phase 2 – Submission & Approval

Employees submit goals for approval.

Managers can:

* Approve goals
* Reject goals
* Send for rework
* Edit targets inline

Approved goals become locked.

---

## Phase 3 – Quarterly Check-ins

Employees periodically update:

* Actual achievements
* Progress status
* Quarterly performance updates

Managers conduct:

* Quarterly review sessions
* Check-in comments
* Progress evaluations

---

## Phase 4 – Governance & Reporting

Admin/HR teams:

* Monitor completion dashboards
* View audit trails
* Unlock goals if required
* Export reports
* Analyze organizational progress

---

# Shared KPI Module

The Shared KPI module allows Managers/Admins to:

* Create department-wide KPIs
* Assign a common KPI to multiple employees
* Track shared performance objectives
* Maintain synchronized KPI structures

This supports collaborative organizational goals.

---

# Analytics Dashboard

The Admin dashboard includes:

* Total goals overview
* Completed goals count
* Pending approvals
* Rework statistics
* Shared KPI analytics
* Completion tracking metrics

This provides governance-level visibility across the organization.

---

# Audit Trail & Governance

The system maintains audit logs for:

* Goal approvals
* Goal edits
* Locked goal modifications
* Quarterly check-ins
* KPI changes

Each log captures:

* Action performed
* User role
* Timestamp
* Goal reference

This ensures accountability and enterprise governance compliance.

---

# Reporting Module

GoalPro supports exportable achievement reporting.

Reports include:

* Employee information
* Planned targets
* Actual achievements
* Progress status
* Approval status
* KPI weightage

Reports can be downloaded in CSV format for organizational review and reporting.

---

# Technology Stack

## Frontend

* React.js
* Vite
* CSS3
* React Router DOM

## Backend / Cloud

* Firebase Authentication
* Cloud Firestore Database

## Deployment

* Vercel

## Version Control

* GitHub

---

# Database Structure

## Users Collection

Stores:

* Name
* Email
* Role

## Goals Collection

Stores:

* Goal details
* Targets
* Achievements
* Progress status
* Approval status
* Shared KPI data

## AuditLogs Collection

Stores:

* Governance logs
* System activity records
* User actions

---

# Security & Access

The platform implements:

* Secure Firebase Authentication
* Role-based navigation
* Protected workflows
* Goal locking mechanisms
* Controlled editing permissions

---

# Deployment Architecture

Users access the system through a browser.

Flow:
Users → React Frontend → Firebase Authentication → Firestore Database → Analytics & Reporting

The application is deployed on Vercel for scalable cloud hosting and continuous deployment.

---

# Key Highlights

* Enterprise-grade workflow management
* Quarterly performance tracking
* Shared KPI governance
* Real-time cloud database
* Audit logging system
* Analytics dashboard
* CSV export reporting
* Multi-role architecture
* Responsive web UI
* Cloud-hosted deployment

---

# Future Enhancements

Potential future upgrades include:

* Microsoft Entra ID (Azure AD) integration
* Email and Teams notifications
* AI-driven KPI recommendations
* Escalation workflows
* Advanced analytics & visual charts
* Department hierarchy management
* Automated reminder systems

---

# Conclusion

GoalPro provides a complete enterprise performance management solution that simplifies organizational goal tracking, strengthens governance, improves managerial visibility, and enables structured quarterly performance workflows in a scalable cloud-based architecture.
