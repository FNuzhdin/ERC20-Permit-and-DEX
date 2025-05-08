# DEX Frontend (Next.js)

## Project Structure

```dash
frontend/
├── public/contracts/ # Auto-generated contract addresses
├── src/
│ ├── app/ # Main pages
│ │ ├── layout.tsx # Root layout
│ │ ├── page.tsx # Main DEX interface
| | └── global.css # CSS styles
│ ├── components/ # UI components
│ │ ├── AdminPanel.tsx
│ │ ├── ExchangeComponent.tsx
│ │ ├── ErrorsAndTxSent.tsx
| | ├── AboutUser.tsx
| | ├── ConnectWallet.tsx
| | └──signERC20Permit.tsx
│ └── typechain/ # Generated contract typings
```

## Start
1. Install dependencies: 
```bash
npm install
```
2. Run development server: 
```bash
npm run dev
```
App will be availadel at http://localhost:3000

## Key featsures
1. Wallet connection
2. ANNA/ETH swapping interface
3. Admin controls for contract owner
4. Transaction error handling

## Contract integration
Frontend interacts with contracts using: 
1. ethers.js # v6 for blockchain communication
2. typechain generated types for type safety

Contracts addresses are loaded from: 
```dash
import deployingData from "../../public/DeployingData.json";
```

## Main Components
1. ExchangeComponent.tsx - Main swap interface
2. ConnectWallet.tsx - Wallet connection
3. AdminPanel.tsx - Owner functions (set rate, manage funds)
4. AboutUser.tsx - User functions (buy, sell)
5. ErrorsAndTxSent.tsx - Displays transaction status
6. signERC20Permit.tsx - Gasless approval implementation

### Screenshots
DEX interface
| User View | Admin View |
|-----------|------------|
| ![User](https://i.imgur.com/a/E6Q9eMh.png) | ![Admin](https://i.imgur.com/TmQPqAV.png) |