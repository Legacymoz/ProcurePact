# ProcurePact

ProcurePact is a procure-to-pay platform empowering SMEs engaged in cross-border trade with instant payments, one-click invoice-backed loans, and business intelligence to keep cash flowing and decisions smart.

## Table of Contents

- [Features](#features)
- [Beta (Partially Implemented)](#beta-partially-implemented)
- [Tech Stack](#tech-stack)
- [Canister Structure](#canister-structure)
- [Running the Project Locally](#running-the-project-locally)
- [Examples](#examples)
- [Areas of Improvement](#areas-of-improvement)

## Features

### Procure-to-pay
Full lifecycle management for vendor agreements, from contract creation, document management, e.g, delivery notes and invoices, to payment for goods and services delivered.

### ckUSDT Stablecoin Settlement

Pay for vendor agreements with ckUSDT stablecoin, enabling low-cost cross-border procurement.

### Locking ckUSDT in Escrow

On-Delivery agreements lock ckUSDT stablecoins in an escrow account, assuring suppliers of payment once deliveries are made, while protecting buyers if suppliers default.

### Invoice-Backed Stablecoin Credit

Convert pending invoices into short-term loans, unlocking instant liquidity without traditional collateral requirements. At the click of a button, get ckUSDT deposited into your wallet.

### Buyer-Supplier Relationship Management

Build and manage your network of customers and suppliers. Request new connections and set up vendor agreements seamlessly.

### OISY Crypto Wallet

A built-in OISY wallet enables seamless deposits and withdrawals of tokens.

### Progressive Web App (PWA)

Our Progressive Web App (PWA) works on mobile, desktop, and web, offering native-like performance across devices.

### Internet Identity Authentication

Secure on-chain authentication with Internet Identity.

## Beta (Partially Implemented)

- AI chatbot for real-time business intelligence - ProcureChat
- Tokenization of invoices to NFTs for third party asset trading

## Tech Stack

Backend: Motoko
Frontend: React+Vite

## Canister Structure

### ProcurePact_backend (Mainnet Canister id: 6kelr-ciaaa-aaaab-absoa-cai)

Manages users and vendor agreement contracts.

### Invoice (Mainnet Canister id: 3742i-7iaaa-aaaab-absqa-cai)

Handles all creation and updating of invoices.

### Credit (Mainnet Canister id: 6eggz-zyaaa-aaaab-abspa-cai)

Issues and collects loans.

### Escrow (Mainnet Canister id: 6dhan-uaaaa-aaaab-abspq-cai)

Locks tokens and releases them for vendor agreements with On-Delivery Payment term.

### ProcurePact_frontend (Mainnet Canister id: 6nfnf-pqaaa-aaaab-absoq-cai)

User Interface.

## Running the Project Locally

### Prerequisites

1. **Clone the repository**
   ```bash
   git clone https://github.com/DannyVRSE/CLM
   cd CLM
   ```

2. **Install npm packages**
   ```bash
   npm install
   ```

3. **Deploy**
   On the project root folder:
   - Make deploy script executable: `chmod +x local_deploy.sh`
   - This script will deploy a dummy ICRC1 token locally to be used for transactions
   - Each new user is allocated some tokens

## Examples

### Escrow Payment Flow

- Buyer and supplier sign vendor agreement with on-delivery payment terms
- Buyer locks token in escrow account
- Supplier issues delivery note
- If the supplier fails to issue a delivery note, the tokens are returned to the buyer's wallet

### Invoice-Backed Loans

- Supplier issues a delivery note and buyer confirms it
- Supplier issues invoice
- Supplier draws credit against pending invoice
- Supplier is given 80% of the invoice value up-front
- When buyer pays the invoice, the supplier gets the 20% remaining value less 3% service charge

## Areas of Improvement

- User KYC and verification to add trust between contracting parties
- Credit score and limits, to ensure the creditworthiness of users
- A dispute resolution system for contracts has to be implemented. This will ensure a fair, non-partisan handling of contract disputes