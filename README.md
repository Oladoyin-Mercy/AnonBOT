# AnonBOT — Anonymous Feedback. Verified On-Chain.

**AnonBOT** is a decentralized, privacy-preserving feedback platform built for **BOTChain**. It enables project creators, presenters, DAO contributors, and team leaders to collect honest, candid feedback without compromising participant anonymity or sacrificing cryptographic authenticity.

---

## 🔒 Core Privacy Model

1. **Room-Scoped Pseudonymous Identities**:
   When entering a feedback room, AnonBOT dynamically generates a cryptographic pseudonym (e.g. `ANON-7F3A91`). This identity is isolated to that specific room — entering a different room generates a distinct identifier (e.g. `ANON-44D821`), preventing cross-room activity correlation.
2. **Zero Wallet Exposure**:
   The feedback creator never sees the participant's wallet address, ENS name, or profile.
3. **Decoupled Architecture**:
   - **Feedback Content** is stored in secure, decentralized/off-chain storage.
   - **Verification Proofs** (SHA-256 payload digest, room ID, anonymous pseudonym, timestamp, and category) are permanently recorded on BOTChain.
4. **Cryptographic Integrity**:
   Anyone can inspect a feedback entry and cryptographically prove that the on-chain recorded hash matches `SHA256(content + roomId + anonymousId)`.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS with custom restrained dark design system, Lucide icons, QRCode.
- **Smart Contracts**: Solidity `AnonBOT.sol` (EVM compatible / BOTChain native).
- **Crypto Engine**: WebCrypto SHA-256 digest computation & real-time hash verification.
- **Web3 Connector**: Injected provider support (MetaMask, OKX, Rabby) + simulated high-performance BOTChain local node.

## 🌐 Network Configuration (BOTChain Testnet)

- **Network Name**: BOTChain Testnet
- **Chain ID**: `968` (Hex: `0x3c8`)
- **RPC Endpoint**: `https://rpc.bohr.life`
- **Native Currency**: `BOT` (18 Decimals)
- **Contract Address**: `0x7B891A4089c16Fe9e18b6dB390F8e3a2414A0b88`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 📜 Smart Contract (`contracts/AnonBOT.sol`)

The `AnonBOT.sol` contract exposes the following core methods on BOTChain:
- `createRoom(string roomId, string title, string question, uint64 durationSeconds, bool allowMultiple)`
- `recordFeedback(string roomId, string anonymousId, bytes32 payloadHash, uint8 category)`
- `setRoomStatus(string roomId, bool isActive)`
- `getRoom(string roomId)`
- `getFeedbackRecord(string roomId, uint256 index)`
- `verifyProof(string roomId, uint256 index, bytes32 calculatedHash)`

---

## 🎨 Design Philosophy

AnonBOT follows strict human-designed developer aesthetics:
- **Near-black charcoal background** (`#0A0B0D`, `#121418`) with warm off-white typography (`#F3F4F6`).
- **BOTChain Mint Accent** (`#00E599`) used with restraint.
- **Crisp hairline borders** and high contrast readability.
- **No AI clichés**: No purple/blue gradient blobs, no floating 3D objects, no oversized hero text, no fake stats.
