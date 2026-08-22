# Eventra

A full-stack event ticketing platform built with **Next.js, Supabase/PostgreSQL, and Paystack**. Eventra allows organizers to create and manage events, while attendees can discover events, purchase tickets, and manage their bookings.

The system was designed around modular application architecture, secure authentication, database-backed event management, and verified payment processing.

---

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [System Architecture](#system-architecture)
* [Core Modules](#core-modules)

  * [Authentication Module](#1-authentication-module)
  * [User & Role Management](#2-user--role-management)
  * [Event Management](#3-event-management)
  * [Ticket Management](#4-ticket-management)
  * [Payment Module](#5-payment-module)
  * [Webhook Processing](#6-webhook-processing)
  * [Order & Transaction Management](#7-order--transaction-management)
  * [Database Module](#8-database-module)
  * [API Layer](#9-api-layer)
  * [Organizer Dashboard](#10-organizer-dashboard)
  * [Attendee Module](#11-attendee-module)
* [Payment Flow](#payment-flow)
* [Security](#security)
* [Technology Stack](#technology-stack)
* [Database](#database)
* [Project Structure](#project-structure)
* [Environment Variables](#environment-variables)
* [Getting Started](#getting-started)
* [Running the Application](#running-the-application)
* [Deployment](#deployment)
* [Future Improvements](#future-improvements)
* [Lessons Learned](#lessons-learned)
* [License](#license)

---

# Overview

Eventra is an event and ticket management platform designed to connect **event organizers** with **attendees**.

The platform supports two primary user roles:

* **Attendee** — discovers events, purchases tickets, and manages their bookings.
* **Organizer** — creates events, manages ticket inventory, monitors transactions, and manages event information.

The application integrates **Paystack** for payment processing and uses server-side webhook verification to ensure that successful transactions are independently verified before tickets are issued.

The project was built to explore the development of a complete SaaS-style application, including authentication, authorization, database design, API integration, payment processing, webhook security, and deployment.

---

# Key Features

### Authentication

* User registration and login
* Session management
* Protected application routes
* Role-based access control
* Authenticated API operations

### Event Management

* Create events
* Update event information
* Manage event details
* Publish event information
* Display available events to attendees

### Ticket Management

* Define ticket prices
* Manage ticket availability
* Associate tickets with events
* Track purchased tickets
* Generate ticket references

### Payments

* Paystack integration
* Payment initialization
* Transaction verification
* Server-side webhook processing
* Payment status tracking
* Prevention of unverified ticket issuance

### Organizer Features

* Event creation and management
* Ticket configuration
* Transaction monitoring
* Event-specific information management

### Attendee Features

* Browse events
* View event details
* Purchase tickets
* View booking information
* Access ticket information

---

# System Architecture

At a high level, Eventra follows a modular full-stack architecture:

```text
                    ┌─────────────────────┐
                    │      Attendee       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Next.js App     │
                    │  UI + Server Logic  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Authentication     Event/Ticket      Payment
              │             Management       Integration
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Supabase / DB     │
                    │     PostgreSQL      │
                    └─────────────────────┘
                               ▲
                               │
                         Verified Events
                               │
                    ┌─────────────────────┐
                    │      Paystack       │
                    │  Payment Gateway    │
                    └─────────────────────┘
```

The application separates responsibilities between authentication, event management, ticketing, payments, transactions, and database operations.

---

# Core Modules

## 1. Authentication Module

The authentication module manages user identity and authenticated sessions.

### Responsibilities

* User registration
* User login
* Session management
* Authentication state
* Protected resources
* Authentication-related error handling

Authentication is handled through **Supabase Auth**.

The module provides the foundation for determining whether a request originates from an authenticated user.

---

## 2. User & Role Management

Eventra separates users according to their responsibilities within the platform.

### Roles

```text
User
├── Attendee
└── Organizer
```

### Attendee

Attendees can:

* Browse events
* Purchase tickets
* View their bookings
* Access ticket information

### Organizer

Organizers can:

* Create events
* Manage events
* Configure ticket information
* Monitor event-related transactions

Role information is used to restrict access to functionality that should only be available to specific users.

---

## 3. Event Management

The Event Management module handles the lifecycle of events.

### Responsibilities

* Create events
* Store event information
* Update event information
* Retrieve event details
* Associate events with organizers
* Manage event availability

An event acts as the primary entity connecting organizers, tickets, and attendee purchases.

Conceptually:

```text
Organizer
    │
    ├── Event
    │     ├── Ticket
    │     ├── Orders
    │     └── Transactions
    │
    └── Event
```

---

## 4. Ticket Management

The Ticket Management module controls ticket configuration and availability.

### Responsibilities

* Ticket creation
* Ticket pricing
* Ticket availability
* Ticket/event relationships
* Ticket references
* Purchased ticket records

Ticket information is associated with an event and is used during the purchasing process.

The platform currently enforces a minimum ticket price of **R50**.

---

## 5. Payment Module

The Payment module integrates Eventra with **Paystack**.

The module is responsible for communicating with the payment provider without allowing payment status to be trusted solely from the client.

### Responsibilities

* Initialize payments
* Generate payment references
* Redirect users to payment
* Verify transactions
* Process payment responses
* Associate transactions with Eventra orders

The payment process follows the principle:

```text
Application
     │
     ▼
Create Order
     │
     ▼
Initialize Payment
     │
     ▼
Paystack
     │
     ▼
Customer Payment
     │
     ▼
Webhook
     │
     ▼
Server-side Verification
     │
     ▼
Update Transaction
     │
     ▼
Issue Ticket
```

---

## 6. Webhook Processing

Webhook processing is one of the security-critical components of Eventra.

The webhook endpoint receives payment events from Paystack and processes them on the server.

The application does not rely solely on information returned by the frontend to determine whether a payment was successful.

### Responsibilities

* Receive payment events
* Validate webhook requests
* Identify transactions
* Verify transaction information
* Confirm the expected amount/reference
* Update transaction status
* Prevent duplicate processing
* Trigger ticket fulfillment only after successful verification

Conceptually:

```text
Paystack
   │
   ▼
Webhook Endpoint
   │
   ▼
Validate Event
   │
   ▼
Identify Transaction
   │
   ▼
Verify Payment
   │
   ├── Invalid → Reject / Ignore
   │
   └── Valid
        │
        ▼
   Mark Transaction Paid
        │
        ▼
   Fulfill Ticket
```

This architecture helps reduce the risk of users manipulating client-side payment responses to obtain tickets without a verified transaction.

---

## 7. Order & Transaction Management

Orders and transactions are separated from the payment interface so that Eventra can maintain its own internal representation of a purchase.

### Order

Represents the user's intended purchase.

```text
Order
├── User
├── Event
├── Ticket
├── Quantity
├── Amount
└── Reference
```

### Transaction

Represents the payment lifecycle associated with an order.

```text
Transaction
├── Order
├── Payment Reference
├── Amount
├── Provider
├── Status
└── Verification Information
```

This separation makes it possible to distinguish between:

* an order being created,
* a payment being initialized,
* a payment being completed,
* a payment being verified,
* and a ticket being fulfilled.

---

## 8. Database Module

Eventra uses **Supabase with PostgreSQL** as its primary database.

The database stores application state including:

* Users
* Roles
* Events
* Tickets
* Orders
* Transactions
* Ticket records
* Payment information

Relationships between these entities allow the application to maintain consistency across the event and payment lifecycle.

A simplified relationship model is:

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Events          Orders
 │               │
 ▼               ▼
Tickets       Transactions
 │
 ▼
Ticket Records
```

Database operations are performed through the application's server-side logic and Supabase integration.

---

## 9. API Layer

The API layer connects the frontend to application functionality and external services.

It is responsible for operations such as:

* Creating events
* Retrieving events
* Managing tickets
* Creating orders
* Initializing payments
* Processing webhooks
* Retrieving transaction information

The API layer acts as the boundary between the user interface, application logic, database, and external services.

---

## 10. Organizer Dashboard

The Organizer Dashboard provides organizers with functionality for managing their events.

### Responsibilities

* Create events
* Edit event information
* Configure tickets
* View event information
* Monitor event-related activity

The dashboard is protected through authentication and authorization controls to prevent attendees from accessing organizer-only functionality.

---

## 11. Attendee Module

The Attendee module provides the customer-facing experience.

### Responsibilities

* Browse available events
* View event details
* Select tickets
* Initiate purchases
* View completed purchases
* Access ticket information

The attendee workflow is designed around:

```text
Discover
   ↓
Select Event
   ↓
Select Ticket
   ↓
Create Order
   ↓
Pay
   ↓
Payment Verification
   ↓
Ticket Fulfillment
```

---

# Payment Flow

The payment lifecycle is intentionally separated into multiple stages.

```text
1. User selects ticket
          ↓
2. Eventra creates order
          ↓
3. Eventra initializes Paystack transaction
          ↓
4. User completes payment
          ↓
5. Paystack sends payment event
          ↓
6. Eventra receives webhook
          ↓
7. Server validates and verifies transaction
          ↓
8. Transaction is marked successful
          ↓
9. Ticket is issued
```

The key principle is:

> **A client-side payment response is not treated as sufficient proof of payment.**

The backend independently verifies the transaction before fulfilling the order.

---

# Security

Security considerations implemented in Eventra include:

### Authentication

Protected functionality requires an authenticated user session.

### Authorization

Application functionality is restricted according to user roles.

### Server-side Payment Verification

Payment information is verified server-side instead of trusting client-side responses.

### Webhook Validation

Incoming payment events are validated before being used to update application state.

### Transaction References

Payment references are associated with internal orders to connect external payment events to the correct Eventra transaction.

### Environment Variables

Sensitive credentials such as API keys and database credentials are stored outside the source code.

---

# Technology Stack

| Technology                  | Purpose                                        |
| --------------------------- | ---------------------------------------------- |
| **Next.js**                 | Full-stack web application framework           |
| **React**                   | User interface                                 |
| **JavaScript / TypeScript** | Application logic                              |
| **Supabase**                | Authentication, database and backend services  |
| **PostgreSQL**              | Relational database                            |
| **Paystack**                | Payment processing                             |
| **REST APIs**               | Application and external service communication |
| **Vercel**                  | Application deployment                         |
| **ngrok**                   | Local webhook testing                          |

---

# Database

The application uses PostgreSQL through Supabase.

The relational database model allows Eventra to connect users, events, tickets, orders, and transactions.

A simplified model:

```text
┌──────────────┐
│     Users    │
└──────┬───────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│    Events    │  │    Orders    │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Tickets    │  │ Transactions │
└──────────────┘  └──────────────┘
```

---

# Project Structure

A simplified representation of the project structure:

```text
eventra/
│
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── events/
│   ├── tickets/
│   └── ...
│
├── components/
│   ├── ui/
│   ├── events/
│   ├── tickets/
│   └── ...
│
├── lib/
│   ├── supabase/
│   ├── payments/
│   ├── database/
│   └── ...
│
├── public/
│
├── .env.local
├── package.json
└── README.md
```

> The exact structure may vary depending on the current implementation.

---

# Environment Variables

Create a `.env.local` file in the project root.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

PAYSTACK_SECRET_KEY=your_paystack_secret_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Do not commit `.env.local` or any secret API credentials to the repository.

---

# Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git
* Supabase project
* Paystack account/API credentials

Clone the repository:

```bash
git clone <repository-url>
cd eventra
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```bash
cp .env.example .env.local
```

Update `.env.local` with the required credentials.

---

# Running the Application

Start the development server:

```bash
npm run dev
```

The application should be available at:

```text
http://localhost:3000
```

For local Paystack webhook testing, a tunneling service such as ngrok can be used to expose the local webhook endpoint.

---

# Deployment

Eventra can be deployed using **Vercel**.

The deployment process involves:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure production environment variables.
4. Deploy the application.
5. Configure the Paystack webhook endpoint to point to the deployed application.
6. Test the complete payment lifecycle.

---

# Future Improvements

Potential improvements include:

* Multiple ticket types
* Event search and filtering
* Email notifications
* Refund processing
* Advanced organizer analytics
* Improved inventory/seat management
* Payment provider abstraction
* Additional payment gateways
* Automated testing
* Rate limiting
* Background job processing
* More comprehensive audit logging

---

# Lessons Learned

Building Eventra provided practical experience across the complete software development lifecycle.

Key areas explored include:

* Designing a relational database
* Building full-stack applications
* Authentication and authorization
* REST API development
* Integrating external APIs
* Payment gateway integration
* Webhook-driven architecture
* Server-side transaction verification
* Application security
* Deployment and production configuration
* Debugging distributed application workflows

One of the most important lessons was that integrating an external service such as a payment gateway requires more than simply calling an API. The application must maintain its own transaction state and independently verify external events before performing sensitive operations such as ticket fulfillment.

# Note:
Eventra is a portfolio project and is not currently intended for public production use. The deployment instructions are provided to demonstrate the project's deployment architecture and configuration.
