# `ProcurePact`

## 🚀 Features

- **Contract Creation**  
  Create and manage legally binding vendor agreements.

- **Participant Invitation**
  Invite all stakeholders to collaborate on the contract (Buyer, Supplier, Third-Party)

- **E-signing of Contracts**
  Sign contracts electronically, eliminating the need for physical paperwork.

- **Delivery Note Generation**
  Automatically generate delivery notes as proof of delivery.

- **Invoices**
  Create invoices and pay invoices directly from contract or delivery data.

- **Locking of Assets in Escrow**
  Secure payments through escrow integration.

- **Flexible Payment Terms**
  Supports various payment configurations:
  1. On Delivery  
  2. Custom payment periods

- **Discounts and Penalties**
  Configure dynamic pricing based on early payment or late delivery.

- **Automatic Asset Transfer**
  Transfer funds automatically on contract fulfillment. (On Delivery payment term)

- **Dispute Resolution**
  Built-in mechanisms to manage and resolve disputes efficiently.

  **Wallet Functionality**
  Connection to crypto wallet


## 🚀 Running locally
1. **Clone the repository**
```bash
git clone <repo-url>
cd <repo-url>
```
2. **Deploy**
Run local_deploy.sh script. This will create identities and deploy all canisters.

In the CLM_backend candid interface:

1. Fund escrow canister. Transfer dummy tokens to escrow canister using ```transfer``` function. These will be used to cover transfer fees for operations.

2. Once users are created in the frontend, use the ```transferToUsers``` function to allocate dummy tokens to user accounts.

This enables users to participate in transactions.
