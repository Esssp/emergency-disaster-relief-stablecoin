# Emergency & Disaster Relief Stablecoin System

This repository contains a software prototype demonstrating a blockchain-inspired system for emergency and disaster relief fund distribution using a fiat-pegged stablecoin model.

The project addresses inefficiencies in traditional relief mechanisms such as delayed transfers, fund misuse, and lack of transparency.

---

## Problem Statement

Disaster relief fund distribution often relies on centralized intermediaries, resulting in delays, leakage, and limited visibility into how funds are utilized. Beneficiaries may not receive aid in time, and donors have little ability to verify fund usage.

---

## Solution Overview

This prototype simulates a stablecoin-based relief distribution platform where verified beneficiaries receive funds directly into permissioned digital wallets. Smart contract–style rules enforce spending restrictions and transaction validation, while all transactions are recorded in a public ledger for auditability.

The system demonstrates how blockchain principles can improve efficiency, transparency, and trust in humanitarian aid delivery.

---

## Key Features

### Beneficiary Whitelisting
Only verified beneficiaries and merchants are allowed to participate in the system, reducing fraud and misuse.

### Category-Based Spending Controls
Funds are allocated under specific categories such as food, medical aid, and shelter. Transactions outside the permitted category are automatically rejected.

### Smart Contract Logic (Simulated)
All transactions follow predefined rules including balance checks, category enforcement, and merchant verification.

### Public Transaction Ledger
Each transaction is recorded with a unique hash, timestamp, sender, receiver, category, and status to enable transparency.

### Role-Based Dashboards
The system provides separate interfaces for administrators, beneficiaries, merchants, and donors to reflect real-world workflows.

---

## Technology Stack

- React.js
- Tailwind CSS
- Lucide Icons
- Simulated blockchain logic implemented in frontend code

This prototype does not use a real blockchain network and is intended for demonstration purposes only.

---

The application will be available at:
http://localhost:5173

---

## Running the Application Locally

```bash
npm install
npm run dev
