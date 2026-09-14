# ⛓️ MedChain — Decentralized Medical Records

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-3.x-F7DF1E?style=flat-square&logo=ethereum)](https://hardhat.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6.x-764ABC?style=flat-square)](https://ethers.org/)
[![IPFS](https://img.shields.io/badge/IPFS-Kubo-65C2CB?style=flat-square&logo=ipfs)](https://ipfs.io)

**Hackathon Demo** • Blockchain-verified medical record integrity using Ethereum + IPFS.

---

## 🏗 Architecture

The MedChain module guarantees tamper-proof verification of medical records, scans, and doctor prescriptions. 

```text
Browser → SHA-256 hash → Upload to IPFS (Pinata) → Register on-chain
Verify  → Fetch from IPFS → Re-hash → Compare with on-chain hash → ✅/❌
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Start the Local Blockchain

```bash
cd contracts
npm install
npx hardhat node
```
This starts a local Ethereum node on `http://127.0.0.1:8545` with 20 pre-funded accounts.

### 2. Deploy the Smart Contract

In a **new terminal**:

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

This deploys `MedicalRecords.sol` and writes the ABI + address to `frontend/lib/deployedContract.json`.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. (Optional) Configure Pinata

Copy `.env.local.example` to `.env.local` and add your Pinata JWT:

```bash
cp .env.local.example .env.local
# Edit .env.local and add your Pinata JWT
```

> [!NOTE]
> Without a Pinata JWT, the app uses a **simulated IPFS** (localStorage) — still fully functional for demos.

---

## 📁 Project Structure

```text
blockchain_feature/
├── contracts/                    # Hardhat project
│   ├── contracts/MedicalRecords.sol
│   ├── scripts/deploy.js
│   ├── test/MedicalRecords.test.js
│   └── hardhat.config.js
├── frontend/                     # Next.js app
│   ├── app/
│   │   ├── page.js              # Landing page
│   │   └── records/page.js      # Records dashboard
│   ├── components/              # React components
│   ├── lib/                     # Utilities (crypto, IPFS, contract)
│   └── styles/globals.css       # Design system
└── README.md
```

---

## 🧪 Run Tests

```bash
cd contracts
npx hardhat test
```

---

## ⚠ Hackathon Scope (Deliberate Cuts)

| Feature | Hackathon Status | Production Spec |
| :--- | :--- | :--- |
| **Encryption** | Files hashed for integrity | Fully encrypted before pinning |
| **KMS / Provider Identity** | Ethereum address allowlist | Integrated KMS identity |
| **Multi-node Network** | Single local/testnet chain | Full distributed network |
| **HIPAA/GDPR Compliance** | Synthetic data only | Full compliance and audits |

---

## 🌐 Public Demo (Free)

1. Get free Sepolia RPC (Alchemy/Infura)
2. Get free Sepolia ETH (faucet)
3. `npx hardhat run scripts/deploy.js --network sepolia`
4. Deploy frontend to Vercel free tier

---
<div align="center">

### 🌿 Built with love for Fund My Crazy 2026 — A Google Gemini Initiative

</div>
