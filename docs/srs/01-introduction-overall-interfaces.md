# Software Requirements Specification (SRS)

**Project:** Event Management System (EMS)
**Version:** 1.0
**Authors:** Varun Rao (PES1UG24CS520), Thanishq Raam Patil (PES1UG24CS502), Vishruta (PES1UG24CS538), Nithin Kumar M (PES1UG25CS829)
**Date:** 11-10-2026
**Status:** Draft

## Revision History

| Version | Date | Author | Change Summary | Approval |
|---------|------|--------|----------------|----------|
| 1.0 | 11-10-2026 | Team | Initial SRS with diagrams | |

## Approvals

| Role | Name | Signature / Email | Date |
|------|------|-------------------|------|
| Course Coordinator | | | |

---

## 1. Introduction

### 1.1 Purpose
This document is the Software Requirements Specification (SRS) for the Event Management System (EMS). It defines the functional and non-functional requirements, external interfaces, security requirements and verification criteria of the system. It is the baseline for the architecture and design specification, the test plan, the project plan and the implementation.

### 1.2 Scope
EMS is a web application that lets organizers create and manage events and lets attendees discover events and register for them.

**In scope:**
- User accounts with role-based access (Attendee, Organizer, Admin)
- Event creation, editing, publishing, cancellation, categorization, search and filtering
- Event registration, waitlisting, cancellation and ticket generation
- Attendance check-in, email and in-app notifications, event reports and CSV export
- Administrative user management and a platform dashboard

**Out of scope:**
- Online payments and paid ticketing
- Venue booking and seat maps
- Native mobile applications
- Integration with third-party calendars or social networks

### 1.3 Audience
Developers, QA engineers, project guides and evaluators, and the maintenance team.

### 1.4 Definitions, Acronyms and Abbreviations

| Term | Meaning |
|------|---------|
| EMS | Event Management System |
| SRS / SAD / STP / RTM | Software Requirements Specification / Software Architecture and Design Specification / Software Test Plan / Requirements Traceability Matrix |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token, used for session authentication |
| API / REST | Application Programming Interface / Representational State Transfer |
| HTTPS / TLS | Hypertext Transfer Protocol Secure / Transport Layer Security |
| SMTP | Simple Mail Transfer Protocol, used for sending email |
| QR code | Quick Response code, a 2D barcode that encodes a ticket ID |
| CSV | Comma-Separated Values file |
| FIFO | First In, First Out |
| Waitlist | Ordered queue of attendees waiting for a seat in a full event |

---

## 2. Overall Description

### 2.1 Product Perspective
EMS is a standalone client-server web application. A React.js single-page frontend communicates with a Node.js/Express REST API, which stores data in a PostgreSQL database and sends email through an external SMTP service.

### 2.2 Major Product Functions
- **F1 Authentication and role management:** account registration, login, logout, role-based access, profile management, user administration
- **F2 Event creation and management:** create, edit, publish, cancel, categorize, browse, search and filter events
- **F3 Event registration and ticketing:** register, waitlist, cancel, automatic waitlist promotion, ticket with QR code, attendee lists
- **F4 Check-in, notifications and reports:** ticket check-in, email and in-app notifications, event reports, CSV export, admin dashboard

### 2.3 User Roles and Characteristics

| Role | Description | Characteristics |
|------|-------------|-----------------|
| Visitor | Unauthenticated user | Can browse and search published events and create an account |
| Attendee | Registered user who attends events | Basic web skills, expects quick registration and a clear confirmation |
| Organizer | Registered user who runs events | Moderate skills, needs control over event details, capacity and attendance data |
| Admin | Platform administrator | Manages users, roles and categories, monitors platform activity |
| Email Service | External system (secondary actor) | Delivers notification emails on behalf of EMS |

### 2.4 Operating Environment
- Client: latest two versions of Google Chrome, Mozilla Firefox and Microsoft Edge, on desktop and mobile screens from 360 px to 1920 px width
- Server: Node.js LTS on Linux, packaged with Docker
- Database: PostgreSQL

### 2.5 Constraints
- Technology stack: React.js, Node.js with Express, PostgreSQL
- Development follows Agile with GitHub Projects, GitHub Actions for CI and SonarQube for static analysis
- No payment processing, so every event is free to register for
- The project must be completed within the academic semester by a team of four

### 2.6 Assumptions and Dependencies
- Users have an internet connection and a valid email address
- An SMTP service is available for notification emails
- All event times are handled in a single configured time zone
- A device camera is optional. Check-in also works by typing the ticket ID.

### 2.7 Requirement ID Conventions

| Prefix | Meaning | Range in use |
|--------|---------|--------------|
| EVT-F-### | Functional requirement | F1: 001-007, F2: 010-016, F3: 020-027, F4: 030-037 |
| EVT-NF-### | Non-functional requirement | 001-006 |
| EVT-SR-### | Security requirement | 001-007 |

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- Responsive web interface with a navigation bar that depends on the user role
- Pages: home and event listing, event details, login and sign-up, my registrations, organizer dashboard, event form, check-in screen, reports, admin console
- Accessibility: keyboard navigation, text alternatives for images and sufficient colour contrast

### 3.2 Hardware Interfaces
EMS needs no special hardware. Optional: a device camera for scanning QR codes at check-in.

### 3.3 Software Interfaces

| Interface | Purpose |
|-----------|---------|
| EMS REST API (JSON over HTTPS) | Communication between the React frontend and the Node.js backend |
| PostgreSQL | Persistent storage of users, events, registrations, notifications and audit logs |
| SMTP email service | Sending confirmation, waitlist, cancellation and reminder emails |

### 3.4 Communications Interfaces
- All client-server traffic uses HTTPS (TLS 1.2 or higher)
- The API exchanges JSON and authenticates requests with a JWT in the Authorization header
- Email is sent asynchronously so a slow mail server does not block user actions
