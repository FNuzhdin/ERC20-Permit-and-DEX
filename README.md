[![Built with Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org)  
[![Token on Sepolia](https://img.shields.io/badge/Token-Sepolia-blue)](https://sepolia.etherscan.io/address/0x5Fa3c9E8cC7518eEA74350882cFaeBbF277aF1Ec)
[![Exchange on Sepolia](https://img.shields.io/badge/Exchange-Sepolia-blue)](https://sepolia.etherscan.io/address/0x94a3eE022C5A75BcB3a9fA3dA686818e26784fFC)

> ERC20 token **ANNA** with a decentralized exchange interface. Supports minting, burning, and gasless approvals via **ERC2612 (permit)**.

---

## ✨ Features

### Token (AnnaToken.sol)

- **Name**: AnnaToken
- **Symbol**: ANNA
- **Standards**: ERC20 + ERC2612 (permit)
- **Special**:
  - `mint()`: Only owner can mint new tokens
  - `burn()`: Users can burn their tokens

### Exchange (DEX.sol)

- Swap **ANNA <> ETH** at an owner-set rate
- **Admin functions**:
  - `setPriceDivisor(divisor)`: Update the ANNA/ETH exchange rate
  - `withdraw()`: Withdraw ETH from the contract
  - `topUp()` or `receive()`: Add liquidity to the contract

### Frontend (Next.js)

- **For users**:
  - Connect Wallet
  - View balances (ETH + ANNA)
  - Swap tokens at current rate
- **For admins**:
  - Set exchange rate
  - Deposit/withdraw contract funds
- **Error handling**: Displays transaction reverts

---

## 🛠 Tech Stack

| Area           | Technologies                             |
| -------------- | ---------------------------------------- |
| **Contracts**  | Solidity, Hardhat, Ethers.js, Mocha/Chai |
| **Frontend**   | Next.js, React, TypeScript               |
| **Deployment** | Sepolia                                  |

---

## 🚀 Quick Start

### 1. Contracts

```bash
cd contracts
npm install
npx hardhat test  # Run tests
npx hardhat node  # Local network
npx hardhat run scripts/deploy.ts --network sepolia  # Deploy

```
### 2. Frontend

cd frontend
npm install
npm run dev # http://localhost:3000

```

SEPOLIA_TOKEN_ADDRESS=0x5Fa3c9E8cC7518eEA74350882cFaeBbF277aF1Ec

SEPOLIA_EXCHANGE_ADDRESS=0x94a3eE022C5A75BcB3a9fA3dA686818e26784fFC

```
### Screenshots
DEX interface
| User View | Admin View |
|-----------|------------|
| ![User](https://i.imgur.com/a/E6Q9eMh.png) | ![Admin](https://i.imgur.com/TmQPqAV.png) |

### License
MIT