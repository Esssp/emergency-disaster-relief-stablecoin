```md
# System Architecture

The system is designed as a simulated permissioned blockchain platform for disaster relief fund distribution.

## Core Components

1. Admin Module  
   Responsible for beneficiary verification and fund allocation across categories.

2. Beneficiary Wallet  
   Receives category-restricted funds and enables payments to authorized merchants.

3. Merchant Module  
   Accepts payments only if authorized for the relevant spending category.

4. Smart Contract Logic (Simulated)  
   Enforces transaction rules such as whitelist validation, balance checks, and category restrictions.

5. Public Ledger  
   Stores all transaction records in an immutable, auditable format.

## Security Considerations

- No personal or sensitive data is stored on-chain.
- All transactions follow predefined rule enforcement.
- Access control is role-based and permissioned.
